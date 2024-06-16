const { icons, otherIcons } = require('../../icons')

module.exports = {
    page: '/feed',
    execute: async (req, res, app, config, themeConfig, info) => {
        if (req.query.action === 'delete') {
            const deleteFeed = req.query.feed
            if (!deleteFeed) return res.redirect('/admin?error=invalidFeed')
            if (!/^\d+$/.test(deleteFeed))
                return res.redirect('/admin?error=invalidFeed')
            if (deleteFeed !== '1' && deleteFeed !== '2' && deleteFeed !== '3')
                return res.redirect('/admin?error=invalidFeed')

            const feeds = await themeConfig.storage.db.get('feeds') || []

            switch (deleteFeed) {
                case '1':
                    if (!feeds[0]) return res.redirect('/admin?error=invalidFeed')
                    feeds.shift()
                    break
                case '2':
                    if (!feeds[1]) return res.redirect('/admin?error=invalidFeed')
                    feeds.splice(1, 1)
                    break
                case '3':
                    if (!feeds[2]) return res.redirect('/admin?error=invalidFeed')
                    feeds.pop()
                    break
            }

            await themeConfig.storage.db.set('feeds', feeds)

            return res.redirect('/admin')
        } else if (req.query.action === 'create') {
            const { color, description, icon } = req.query
            if (!color || !description || !icon)
                return res.redirect('/admin?error=missingData')
            if (
                color !== 'red' &&
                color !== 'orange' &&
                color !== 'pink' &&
                color !== 'gray' &&
                color !== 'green' &&
                color !== 'blue' &&
                color !== 'dark'
            )
                return res.redirect('/admin?error=invalidData')
            if (description.length < 3 || description.length > 128)
                return res.redirect('/admin?error=invalidData')
            if (!icons.includes(icon) && !otherIcons.includes(icon))
                return res.redirect('/admin?error=invalidData')
            let diff
            let col
            if (otherIcons.includes(icon)) diff = true
            if (color === 'red') col = 'danger'
            if (color === 'orange') col = 'warning'
            if (color === 'pink') col = 'primary'
            if (color === 'gray') col = 'secondary'
            if (color === 'green') col = 'success'
            if (color === 'blue') col = 'info'
            if (color === 'dark') col = 'dark'

            const feeds = await themeConfig.storage.db.get("feeds") || []

            if (feeds.length === 3) {
                feeds.shift()
                feeds.push({
                    color: col,
                    description: description,
                    published: Date.now(),
                    icon: icon,
                    diff: diff
                })
            } else feeds.push({
                color: col,
                description: description,
                published: Date.now(),
                icon: icon,
                diff: diff
            })

            await themeConfig.storage.db.set("feeds", feeds)

            return res.redirect('/admin')
        }
    }
}
