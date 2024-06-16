const Discord = require('discord.js');

module.exports = function (config, themeConfig) {
    config.guildSettings = async function (req, res, home, category) {
        if (!req.session.user) return res.redirect('/discord?r=/guild/' + req.params.id);

        const bot = config.bot;
        const guildId = req.params.id;
        const userId = req.session.user.id;

        if (!bot.guilds.cache.get(guildId)) {
            try {
                await bot.guilds.fetch(guildId);
            } catch (err) { }
        }

        const guild = bot.guilds.cache.get(guildId);
        if (!guild) return res.redirect('/manage?error=noPermsToManageGuild');

        let member = guild.members.cache.get(userId);
        if (!member) {
            try {
                member = await guild.members.fetch(userId);
            } catch (err) {
                return res.redirect('/manage?error=noPermsToManageGuild');
            }
        }

        if (!member) return res.redirect('/manage?error=noPermsToManageGuild');

        const discordJsVersion = Discord.version.split('.')[0];
        const requiredPermissions = req.requiredPermissions;

        for (const permission of requiredPermissions) {
            let convertedPermission = permission[0];
            if (discordJsVersion === '14') {
                convertedPermission = await convertPermission(permission[0]);
            }

            if (!member.permissions.has(convertedPermission)) {
                return res.redirect('/manage?error=noPermsToManageGuild');
            }
        }

        if (guild.channels.cache.size < 1) {
            try {
                await guild.channels.fetch();
            } catch (err) { }
        }

        if (guild.roles.cache.size < 2) {
            try {
                await guild.roles.fetch();
            } catch (err) { }
        }

        const actualSettings = {};
        const toggleSettings = {};
        const premiumSettings = {};
        const canUseSettings = {};

        if (config.settings?.length) {
            for (const category of config.settings) {
                if (!canUseSettings[category.categoryId]) canUseSettings[category.categoryId] = {};
                if (!actualSettings[category.categoryId]) actualSettings[category.categoryId] = {};

                if (config.useCategorySet) {
                    let categoryOptions = await category.getActualSet({
                        guild: { id: guildId, object: guild },
                        user: { id: userId, object: member },
                    });

                    if (category.toggleable) {
                        toggleSettings[category.categoryId] = categoryOptions.find(o => o.optionId === "categoryToggle")?.data || null;
                        categoryOptions = categoryOptions.filter(o => o.optionId !== 'categoryToggle');
                    }

                    if (req.params.category && category.premium) {
                        premiumSettings[category.categoryId] = await category.premiumUser({ guild: { id: guildId }, user: { id: userId } });
                    }

                    if (category.premium && !premiumSettings[category.categoryId]) {
                        return res.redirect(`/settings/${guildId}?error=premiumRequired`);
                    }

                    // Called when using categorySet
                    await processCategoryOptions(category, categoryOptions, actualSettings, canUseSettings, guildId, userId);
                } else {
                    await processNonCategoryOptions(config.settings, actualSettings, canUseSettings, toggleSettings, premiumSettings, guildId, userId, req.params.category);
                }
            }
        }

        const errors = req.session.errors?.split('%and%') || [];
        const success = req.session.success === true || req.session.success?.split('%and%') || [];

        req.session.errors = null;
        req.session.success = null;

        const guildIcon = guild.iconURL() || themeConfig?.icons?.noGuildIcon;

        res.render('settings', {
            successes: success,
            errors: errors,
            settings: config.settings,
            actual: actualSettings,
            toggle: toggleSettings,
            premium: premiumSettings,
            canUseList: canUseSettings,
            bot: config.bot,
            guild,
            userid: userId,
            gIcon: guildIcon,
            req,
            guildid: guildId,
            themeConfig: req.themeConfig,
            config
        });
    };
}

async function convertPermission(permission) {
    const permissionMap = {
        'CREATE_INSTANT_INVITE': 'CreateInstantInvite',
        'KICK_MEMBERS': 'KickMembers',
        'BAN_MEMBERS': 'BanMembers',
        'ADMINISTRATOR': 'Administrator',
        'MANAGE_CHANNELS': 'ManageChannels',
        'MANAGE_GUILD': 'ManageGuild',
        'ADD_REACTIONS': 'AddReactions',
        'VIEW_AUDIT_LOG': 'ViewAuditLog',
        'PRIORITY_SPEAKER': 'PrioritySpeaker',
        'STREAM': 'Stream',
        'VIEW_CHANNEL': 'ViewChannel',
        'SEND_MESSAGES': 'SendMessages',
        'SEND_TTS_MESSAGES': 'SendTTSMessages',
        'MANAGE_MESSAGES': 'ManageMessages',
        'EMBED_LINKS': 'ManageMessages',
        'ATTACH_FILES': 'AttachFiles',
        'READ_MESSAGE_HISTORY': 'ReadMessageHistory',
        'MENTION_EVERYONE': 'MentionEveryone',
        'USE_EXTERNAL_EMOJIS': 'UseExternalEmojis',
        'VIEW_GUILD_INSIGHTS': 'ViewGuildInsights',
        'CONNECT': 'Connect',
        'SPEAK': 'Speak'
    };

    return permissionMap[permission] || 'NULL';
}
// Called when using category set
async function processCategoryOptions(category, options, actualSettings, canUseSettings, guildId, userId) {
    for (const option of options) {
        if (!option || !option.optionId) {
            console.log("WARNING: You haven't set the optionId for a category option in your config. This is required for the category option to work.");
            continue;
        }

        let configOption = category.categoryOptionsList.find(c => c.optionId == option.optionId);
        if (!configOption) {
            for (const cat of category.categoryOptionsList) {
                if (cat.optionType.type === 'multiRow') {
                    configOption = cat.optionType.options.find(o => o.optionId == option.optionId);
                    if (configOption) {
                        break;
                    }
                }
            }
        }
        
        if (configOption) {
            const canUse = await (configOption.allowedCheck ? configOption.allowedCheck({ guild: { id: guildId }, user: { id: userId } }) : { allowed: true, errorMessage: null });
            if (typeof canUse !== 'object') {
                throw new TypeError(`${category.categoryId} category option with id ${configOption.optionId} allowedCheck function needs to return {allowed: Boolean, errorMessage: String | null}`);
            }
            canUseSettings[category.categoryId][configOption.optionId] = canUse;

            switch (configOption.optionType.type) {
                case "rolesMultiSelect":
                case "channelsMultiSelect":
                case "multiSelect":
                case "tagInput":
                    actualSettings[category.categoryId][configOption.optionId] = options.find(o => o.optionId === configOption.optionId)?.data || [];
                    break;
                case "spacer":
                    actualSettings[category.categoryId][configOption.optionId] = { type: 'spacer', themeOptions: configOption.themeOptions };
                    break;
                default:
                    actualSettings[category.categoryId][configOption.optionId] = options.find(o => o.optionId === configOption.optionId)?.data || null;
                    break;
            }
        } else {
            console.log(`WARNING: Option ${option.optionId} in category ${category.categoryId} doesn't exist in your config.`);
        }
    }
}

// Called when not using category set
async function processNonCategoryOptions(settings, actualSettings, canUseSettings, toggleSettings, premiumSettings, guildId, userId, requestCategory) {
    for (const setting of settings) {
        if (!canUseSettings[setting.categoryId]) canUseSettings[setting.categoryId] = {};
        
        if (setting.toggleable) {
            toggleSettings[setting.categoryId] = await setting.getActualSet({ guild: { id: guildId } });
        }

        if (requestCategory && setting.premium) {
            premiumSettings[setting.categoryId] = await setting.premiumUser({ guild: { id: guildId }, user: { id: userId } });
        }

        if (requestCategory && setting.premium && !premiumSettings[setting.categoryId]) {
            return res.redirect(`/settings/${guildId}?error=premiumRequired`);
        }

        for (const option of setting.categoryOptionsList) {
            const canUse = await (option.allowedCheck ? option.allowedCheck({ guild: { id: guildId }, user: { id: userId } }) : { allowed: true, errorMessage: null });
            if (typeof canUse !== 'object') {
                throw new TypeError(`${setting.categoryId} category option with id ${option.optionId} allowedCheck function needs to return {allowed: Boolean, errorMessage: String | null}`);
            }
            canUseSettings[setting.categoryId][option.optionId] = canUse;

            if (!actualSettings[setting.categoryId]) actualSettings[setting.categoryId] = {};

            switch (option.optionType.type) {
                case 'spacer':
                    actualSettings[setting.categoryId][option.optionId] = { type: 'spacer', themeOptions: option.themeOptions };
                    break;
                case 'multiRow':
                    for (const item of option.optionType.options) {
                        actualSettings[setting.categoryId][item.optionId] = await item.getActualSet({ guild: { id: guildId }, user: { id: userId } });
                    }
                    break;
                default:
                    actualSettings[setting.categoryId][option.optionId] = await option.getActualSet({ guild: { id: guildId }, user: { id: userId } });
                    break;
            }
        }
    }
}
