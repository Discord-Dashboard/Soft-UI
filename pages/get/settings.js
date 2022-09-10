module.exports = {
    page: '/settings/:id/:category',
    execute: async (req, res, app, config, themeConfig, info) => {
        const categoryExists = config.settings.find(s => s.categoryId === req.params.category);
        if (!categoryExists) return config.errorPage(req, res, null, 404);

        await config.guildSettings(req, res, false, req.params.category);
    }
}