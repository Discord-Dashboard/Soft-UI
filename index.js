const colors = require('colors');
const npmUpdater = require('./utils/updater/npm');
const fileUpdater = require('./utils/updater/files');
const consolePrefix = `${"[".blue}${"dbd-soft-ui".yellow}${"]".blue} `;

module.exports = (themeConfig = {}) => {
    return {
        themeCodename: 'softui',
        viewsPath: require('path').join(__dirname, '/views'),
        staticPath: require('path').join(__dirname, '/views/src'),
        themeConfig: {
            ...themeConfig,
            defaultLocales: require('./locales.js'),
        },
        messages: {
            error: {
                addonLicense: `${consolePrefix}${"Failed to initialise {{ADDON}}.\nThe license this addon was installed with does not match your current discord-dashboard license.".cyan}`,
            },
            success: {
                addonLoaded: `${consolePrefix}${"Successfully loaded {{ADDON}}.".cyan}`
            }
        },
        embedBuilderComponent: require('fs').readFileSync(require('path').join(__dirname, '/embedBuilderComponent.txt'), 'utf8'),
        init: async (app, config) => {
            let outdated = false;
            (async () => {
                let check = await npmUpdater.update();
                await fileUpdater.update();
                if (!check) outdated = true;
            })();

            require('./utils/functions/errorHandler')(config, themeConfig)
            require('./utils/functions/settingsPage')(config, themeConfig)
            // await require('./utils/addonManager').execute(themeConfig, config, app, module.exports.messages);
            require('./utils/initPages').init(config, themeConfig, app);
        }
    }
}


module.exports.formTypes = require('./utils/formtypes');
module.exports.Feed = require('./utils/feedHandler');
module.exports.cmdHandler = require('./utils/cmdHandler');