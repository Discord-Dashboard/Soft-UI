module.exports = {
    page: "/privacy-policy",
    execute: async (req, res, app, config, themeConfig, info) => {
        res.render("pp", {
            req,
            config,
            themeConfig,
            info,
        })
    },
}
