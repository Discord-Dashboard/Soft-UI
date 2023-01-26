module.exports = {
    page: '/stats/logs/update',
    execute: async (req, res, app, config, themeConfig, info, db) => {
        if (
            'Bearer ' + themeConfig.admin.logs?.key !==
            req.headers.authorization
        )
            return res.json({ status: 'Invalid sharding key' })

        const logs = await db.get('logs')

        let newLogs = []

        if (!logs || !logs.length || !logs[0])
            newLogs = [req.body]
        else
            newLogs = [req.body, ...logs]

        await db.set('logs', newLogs)

        res.json({ status: 'Completed' })
    }
}