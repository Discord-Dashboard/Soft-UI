const consolePrefix = `${'['.blue}${'dbd-soft-ui'.yellow}${']'.blue} `
const colors = require('colors')
const { icons, otherIcons } = require('../icons')

module.exports = class Feed {
    constructor(db) {
        this.setColor = function (color) {
            if (!color) throw new Error(`${consolePrefix}${`Failed to modify feed. ${colors.red('Invalid color.')}`.cyan}`);
            if (
                color !== 'red' &&
                color !== 'orange' &&
                color !== 'pink' &&
                color !== 'gray' &&
                color !== 'green' &&
                color !== 'blue' &&
                color !== 'dark'
            ) {
                throw new Error(`${consolePrefix}${`Failed to modify feed. ${colors.red('Invalid color.')}`.cyan}`);
            }

            this.color = color;
            return this;
        }

        this.setDescription = function (description) {
            if (!description) throw new Error(`${consolePrefix}${`Failed to modify feed. ${colors.red('Invalid description.')}`.cyan}`);
            if (description.length < 3 || description.length > 128) console.log(`${consolePrefix}${'Invalid description'.cyan}`);
            this.description = description;
            return this;
        }

        this.setIcon = function (icon) {
            if (!icon) throw new Error(`${consolePrefix}${`Failed to modify feed. ${colors.red('Invalid icon.')}`.cyan}`);
            if (!icons.includes(icon) && !otherIcons.includes(icon)) throw new Error(`${consolePrefix}${`Failed to modify feed. ${colors.red('Invalid icon.')}`.cyan}`);
            this.icon = icon;
            return this;
        }

        this.getFeed = async function (id) {
            if (!id) throw new Error(`${consolePrefix}${`Failed to get feed. ${colors.red('Invalid id.')}`.cyan}`);

            const feeds = await themeConfig.storage.db.get('feeds') || []

            let currentFeed = {}

            switch (id.toString()) {
                case '1':
                    currentFeed = feeds[0]
                    break
                case '2':
                    currentFeed = feeds[1]
                    break
                case '3':
                    currentFeed = feeds[2]
                    break
                case 'all':
                    currentFeed = feeds

            }

            if (!currentFeed) throw new Error(`${consolePrefix}${`Failed to get feed. ${colors.red('Feed not found.')}`.cyan}`);
            this.feed = currentFeed;
            return this;
        }

        this.delete = async function () {
            if (!this.feed) throw new Error(`${consolePrefix}${`Failed to delete feed. ${colors.red('Feed not selected')}`.cyan}`);

            const feeds = await themeConfig.storage.db.get('feeds') || []

            switch (this.feed.id.toString()) {
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

            return this;
        }

        this.send = async function () {
            const { color, description, icon } = this;

            let diff;
            let col;
            if (otherIcons.includes(icon)) diff = true;

            if (color === 'red') col = 'danger';
            if (color === 'orange') col = 'warning';
            if (color === 'pink') col = 'primary';
            if (color === 'gray') col = 'secondary';
            if (color === 'green') col = 'success';
            if (color === 'blue') col = 'info';
            if (color === 'dark') col = 'dark';

            const feeds = await db.get("feeds") || []

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

            await db.set("feeds", feeds)

            return res.redirect('/admin')
        }
    }
}