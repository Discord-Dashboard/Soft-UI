module.exports = {
    page: '/commands',
    execute: async (req, res, app, config, themeConfig, info) => {
        if (themeConfig.commands) res.render('commands.ejs', {
            req,
            config,
            themeConfig,
            info
        });
    }
}