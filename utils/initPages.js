const fs = require('fs')
const colors = require('colors')
const consolePrefix = `${'['.blue}${'dbd-soft-ui'.yellow}${']'.blue} `

module.exports = {
    init: async function (config, themeConfig, app, db) {
        let info;
        if (themeConfig?.customThemeOptions?.info) info = await themeConfig.customThemeOptions.info({ config: config });
        const eventFolders = fs.readdirSync(`${__dirname}/../pages`)

        for (const folder of eventFolders) {
            const eventFiles = fs
                .readdirSync(`${__dirname}/../pages/${folder}`)
                .filter((file) => file.endsWith('.js'));
            for (const file of eventFiles) {
                const e = require(`${__dirname}/../pages/${folder}/${file}`);
                try {
                    if (folder === 'admin') {
                        app.get(e.page, async function (req, res) {
                            if (!req.session.user) return res.sendStatus(401)
                            if (!config.ownerIDs.includes(req.session.user.id)) return res.sendStatus(403);
                            e.execute(
                                req,
                                res,
                                app,
                                config,
                                themeConfig,
                                info,
                                db
                            )
                        })
                    } else if (folder === 'post') {
                        app.post(e.page, function (req, res) {
                            e.execute(
                                req,
                                res,
                                app,
                                config,
                                themeConfig,
                                info,
                                db
                            )
                        })
                    } else if (folder === 'get') {
                        app.use(e.page, async function (req, res) {
                            e.execute(
                                req,
                                res,
                                app,
                                config,
                                themeConfig,
                                info,
                                db
                            )
                        })
                    }
                } catch (error) {
                    console.log(`${consolePrefix}${'Failed to load:'.cyan} ${colors.red(e.page)}`);
                    console.log(`Page handler ${file}: ${error}`);
                }
            }
        }

        app.use('*', async function (req, res) {
            res.status(404)
            config.errorPage(req, res, undefined, 404)
        })

        app.use((err, req, res, next) => {
            res.status(500)
            config.errorPage(req, res, err, 500)
        })

        console.log(`${consolePrefix}${'Initialised all pages!'.cyan}`);
    }
}