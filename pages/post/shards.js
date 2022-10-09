module.exports = {
    page: '/stats/shards/update',
    execute: async (req, res, app, config, themeConfig, info, db) => {
        
        if("Bearer "+themeConfig.shardspage?.key !== req.headers.authorization) return res.json({ status: "Invalid sharding key" });

        await db.set('stats', req.body)

        res.json({ status: "Completed" })
    }
}