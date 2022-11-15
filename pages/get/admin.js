const Nodeactyl = require('nodeactyl')
const db = require('quick.db')

module.exports = {
    page: '/admin',
    execute: async (req, res, app, config, themeConfig, info) => {
        const pterodactyl = new Nodeactyl.NodeactylClient(
            themeConfig.admin.pterodactyl.panelLink,
            themeConfig.admin.pterodactyl.apiKey
        )
        if (!req.session.user) return res.redirect('/discord?r=/admin/')
        if (!config.ownerIDs.includes(req.session.user.id))
            return res.redirect('/')
        if (!pterodactyl && themeConfig.admin.pterodactyl.enabled)
            return res.send(
                'Unable to contact Pterodactyl, are your details correct?'
            )

        async function getServers() {
            if (!themeConfig.admin.pterodactyl.enabled) return []
            const serverData = []
            for (const uuid of themeConfig.admin.pterodactyl.serverUUIDs) {
                let dataStatus = await pterodactyl.getServerStatus(uuid)
                let data = await pterodactyl.getServerDetails(uuid)
                serverData.push({
                    name: data.name.toString(),
                    uuid: data.uuid.toString(),
                    desc: data.description.toString(),
                    node: data.node.toString(),
                    status: dataStatus.toString()
                })
            }
            return serverData
        }

        let allFeedsUsed = false
        if (db.get('feeds.one') && db.get('feeds.two') && db.get('feeds.three'))
            allFeedsUsed = true
        const d = await getServers()
        res.render('admin', {
            req,
            sData: d,
            themeConfig: req.themeConfig,
            node: pterodactyl,
            bot: config.bot,
            allFeedsUsed,
            config,
            require
        })
    }
}
