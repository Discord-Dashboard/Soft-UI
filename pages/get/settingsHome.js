module.exports = {
    page: '/settings/:id/',
    execute: async (req, res, app, config, themeConfig, info) => {
        await config.guildSettings(req, res, true);
    }
}