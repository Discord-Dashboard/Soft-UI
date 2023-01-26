module.exports = {
    page: '/stats/shards/update',
    execute: async (req, res, app, config, themeConfig, info, db) => {
        if (
            'Bearer ' + themeConfig.shardspage?.key !==
            req.headers.authorization
        )
            return res.json({ status: 'Invalid sharding key' })

        const stats = await db.get('stats')

        const clean = req.body.map((s) => {
            if (!stats) return {
                ...s,
                ping: [0, 0, 0, 0, 0, 0, 0, 0, 0, s.ping]
            }

            const currentSaved = stats?.find((x) => x.id === s.id)
            if (!currentSaved) return {
                ...s,
                ping: [0, 0, 0, 0, 0, 0, 0, 0, 0, s.ping]
            }

            const nextPing = currentSaved?.ping?.slice(1, 10)

            return {
                ...s,
                ping: nextPing ? [...nextPing, s.ping] : [0, 0, 0, 0, 0, 0, 0, 0, 0, s.ping],
            }
        })

        await db.set('stats', clean)

        res.json({ status: 'Completed' })
    }
}
