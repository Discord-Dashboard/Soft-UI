module.exports = {
    page: '/credits',
    execute: async (req, res, app, config, themeConfig, info) => {
        res.render('credits', {
            req: req,
            config,
            themeConfig,
            info
        });
    }
}