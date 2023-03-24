const npmUpdater = require('../../utils/updater/npm')
const fileUpdater = require('../../utils/updater/files')

module.exports = {
    page: '/control',
    execute: async (req, res, app, config, themeConfig, info) => {
        
        const { uuid, action } = req.query
        if (!uuid && action && req.query.type) {
            if (req.query.type === 'npm') await npmUpdater.update()
            if (req.query.type === 'live') await fileUpdater.update()
            return res.redirect('/admin?result=true')
        }
        if (!uuid || !action) return res.sendStatus(412)

        try {
            if (action === 'start') await themeConfig.nodeactyl.startServer(uuid)
            if (action === 'restart') await themeConfig.nodeactyl.restartServer(uuid)
            if (action === 'stop') await themeConfig.nodeactyl.stopServer(uuid)
            if (action === 'kill') await themeConfig.nodeactyl.killServer(uuid)
        } catch (error) {
            console.error(error)
            return res.redirect('/admin?result=false')
        }
        return res.redirect('/admin?result=true')
    }
}
