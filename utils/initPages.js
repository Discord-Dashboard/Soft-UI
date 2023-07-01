const fs = require('fs')
const colors = require('colors')
const consolePrefix = `${'['.blue}${'dbd-soft-ui'.yellow}${']'.blue} `
const Nodeactyl = require('nodeactyl')

module.exports = {
    init: async function (config, themeConfig, app, db) {
        let info;
        if (themeConfig?.customThemeOptions?.info) info = await themeConfig.customThemeOptions.info({ config: config });
        if (themeConfig?.admin?.pterodactyl?.enabled) {
            themeConfig.nodeactyl = new Nodeactyl.NodeactylClient(
                themeConfig.admin?.pterodactyl?.panelLink,
                themeConfig.admin?.pterodactyl?.apiKey
            )

            try {
                await themeConfig.nodeactyl.getAccountDetails();
            } catch (error) {
                console.log(`${consolePrefix}${('Failed to connect to Pterodactyl panel!\nEnsure you\'ve used a CLIENT api key, (found at ' + themeConfig.admin.pterodactyl.panelLink + '/account/api)').red}`);
            }
        }
        const eventFolders = fs.readdirSync(`${__dirname}/../pages`)

        for (const folder of eventFolders) {
            const eventFiles = fs
                .readdirSync(`${__dirname}/../pages/${folder}`)
                .filter((file) => file.endsWith('.js'));
            for (const file of eventFiles) {
                const e = require(`${__dirname}/../pages/${folder}/${file}`);
                try {
                    if (folder === 'admin') {
                        await app.get(e.page, async function (req, res) {
                            if (!req.session.user) return res.sendStatus(401)
                            if (!config.ownerIDs?.includes(req.session.user.id)) return res.sendStatus(403);
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
                        await app.post(e.page, function (req, res) {
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
                        await app.use(e.page, async function (req, res) {
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


        app.get(
            themeConfig.landingPage?.enabled ? "/dash" : "/",
            async (req, res) => {
                let customThemeOptions
                if (themeConfig?.customThemeOptions?.index) {
                    customThemeOptions = await themeConfig.customThemeOptions.index(
                        { req: req, res: res, config: config }
                    )
                }
                res.render("index", {
                    req: req,
                    themeConfig: req.themeConfig,
                    bot: config.bot,
                    customThemeOptions: customThemeOptions || {},
                    config,
                    require,
                    feeds: await themeConfig.storage.db.get("feeds") || [],
                })
            }
        )

        if (themeConfig.landingPage?.enabled)
            app.get("/", async (req, res) => {
                res.setHeader("Content-Type", "text/html")
                res.send(await themeConfig.landingPage.getLandingPage(req, res))
            })

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