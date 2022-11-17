const colors = require('colors')
const npmUpdater = require('./utils/updater/npm')
const fileUpdater = require('./utils/updater/files')
const consolePrefix = `${'['.blue}${'dbd-soft-ui'.yellow}${']'.blue} `
const Keyv = require('keyv')
const path = require('path')

module.exports = (themeConfig = {}) => {
    return {
        themeCodename: 'softui',
        viewsPath: path.join(__dirname, '/views'),
        staticPath: path.join(__dirname, '/views/src'),
        themeConfig: {
            ...themeConfig,
            defaultLocales: require('./locales.js')
        },
        messages: {
            error: {
                addonLicense: `${consolePrefix}${
                    'Failed to initialise {{ADDON}}.\nThe license this addon was installed with does not match your current discord-dashboard license.'
                        .cyan
                }`
            },
            success: {
                addonLoaded: `${consolePrefix}${
                    'Successfully loaded {{ADDON}}.'.cyan
                }`
            }
        },
        embedBuilderComponent: require('fs').readFileSync(
            path.join(__dirname, '/embedBuilderComponent.txt'),
            'utf8'
        ),
        init: async (app, config) => {
            let outdated = false
            ;(async () => {
                let check = await npmUpdater.update()
                await fileUpdater.update()
                if (!check) outdated = true
            })()

            const db = new Keyv(
                themeConfig.dbdriver ||
                    'sqlite://' + path.join(__dirname, '/database.sqlite')
            )

            db.on('error', (err) => {
                console.log('Connection Error', err)
                process.exit()
            })

            themeConfig = {
                ...themeConfig,
                defaultLocales: require('./locales.js')
            }

            require('./utils/functions/errorHandler')(config, themeConfig, db)
            require('./utils/functions/settingsPage')(config, themeConfig, db)
            // await require('./utils/addonManager').execute(themeConfig, config, app, module.exports.messages);
            require('./utils/initPages').init(config, themeConfig, app, db)
        }
    }
}

module.exports.partials = __dirname + '/views/partials'
module.exports.formTypes = require('./utils/formtypes')
module.exports.Feed = require('./utils/feedHandler')
module.exports.cmdHandler = require('./utils/cmdHandler')
