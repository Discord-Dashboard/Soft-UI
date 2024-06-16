module.exports = {
    page: '/commands',
    execute: async (req, res, app, config, themeConfig, info) => {
        if (themeConfig.commands?.length)
            res.render('commands.ejs', {
                req,
                config,
                themeConfig,
                info
            })
        else return config.errorPage(req, res, undefined, 404)
    }
}
