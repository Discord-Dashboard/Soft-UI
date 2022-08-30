module.exports = {
    page: '/blacklisted',
    execute: async (req, res, app, config, themeConfig, info) => {
        res.render('blacklisted', {
            req,
            config,
            themeConfig,
            info
        });
    }
}