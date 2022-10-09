module.exports = {
    page: '/shards',
    execute: async (req, res, app, config, themeConfig, info, db) => {
        res.render('shards', {
            req: req,
            config,
            themeConfig,
            info
        });
    }
}