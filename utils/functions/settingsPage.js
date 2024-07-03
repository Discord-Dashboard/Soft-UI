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
                    let getActualCategory = await category.getActualSet({
                        guild: { id: guildId, object: guild },
                        user: { id: userId, object: member },
                    });
                    
                    if (category.toggleable) {
                        toggleSettings[category.categoryId] = getActualCategory.find(o => o.optionId === "categoryToggle")?.data || null;
                        getActualCategory = getActualCategory.filter(o => o.optionId !== 'categoryToggle');
                    }

                    // If the category is premium, check if the user has premium
                    if (req.params.category && category.premium) {
                        premiumSettings[category.categoryId] = await category.premiumUser({ guild: { id: guildId }, user: { id: userId } });
                    }

                    // If the category is premium and the user doesn't have premium, redirect them
                    if (category.premium && !premiumSettings[category.categoryId]) {
                        return res.redirect(`/settings/${guildId}?error=premiumRequired`);
                    }

                    // Called when using categorySet
                    await processCategoryOptions(category, getActualCategory, actualSettings, canUseSettings, guildId, userId);
                } else {
                    if (category.toggleable) {
                        toggleSettings[category.categoryId] = await category.getActualSet({ guild: { id: guildId } }) || false;
                    }

                    // If the category is premium, check if the user has premium
                    if (req.params.category && category.premium) {
                        premiumSettings[category.categoryId] = await category.premiumUser({ guild: { id: guildId }, user: { id: userId } });
                    }

                    // If the category is premium and the user doesn't have premium, redirect them
                    if (req.params.category && category.premium && !premiumSettings[category.categoryId]) {
                        return res.redirect(`/settings/${guildId}?error=premiumRequired`);
                    }

                    // Called when not using categorySet
                    await processNonCategoryOptions(category, actualSettings, canUseSettings, guildId, userId);
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
async function processCategoryOptions(category, getActualCategory, actualSettings, canUseSettings, guildId, userId) {
    // Loop through all options in config.settings[i]
    for (const option of category.categoryOptionsList) {
        switch (option.optionType.type) {
            case 'multiRow':
                // Loop through all sub-options in multiRow
                for (const item of option.optionType.options) {
                    const canUse = await (item.allowedCheck ? item.allowedCheck({ guild: { id: guildId }, user: { id: userId } }) : { allowed: true, errorMessage: null });
                    if (typeof canUse !== 'object') {
                        throw new TypeError(`${category.categoryId} category option with id ${item.optionId} allowedCheck function needs to return {allowed: Boolean, errorMessage: String | null}`);
                    }

                    canUseSettings[category.categoryId][item.optionId] = canUse;
                    actualSettings[category.categoryId][item.optionId] = getActualCategory.find(o => o.optionId === item.optionId)?.data || (item.optionType.type === 'tagInput' ? [] : null);
                }
                break;
            case "spacer":
                // Return basic spacer object
                actualSettings[category.categoryId][configOption.optionId] = { type: 'spacer', themeOptions: configOption.themeOptions };
                break;
            case "rolesMultiSelect":
            case "channelsMultiSelect":
            case "multiSelect":
            case "tagInput":
            case "tagInput":
                // Return empty array if no data
                actualSettings[category.categoryId][configOption.optionId] = getActualCategory.find(o => o.optionId === configOption.optionId)?.data || [];
                break;
            default:
                // Return data if it exists for all other formTypes, otherwise return null
                const canUse = await (option.allowedCheck ? option.allowedCheck({ guild: { id: guildId }, user: { id: userId } }) : { allowed: true, errorMessage: null });
                if (typeof canUse !== 'object') {
                    throw new TypeError(`${category.categoryId} category option with id ${option.optionId} allowedCheck function needs to return {allowed: Boolean, errorMessage: String | null}`);
                }

                canUseSettings[category.categoryId][option.optionId] = canUse;
                actualSettings[category.categoryId][option.optionId] = getActualCategory.find(o => o.optionId === option.optionId)?.data || null;
                break;
        }
    }
}

// Called when not using category set
async function processNonCategoryOptions(category, actualSettings, canUseSettings, guildId, userId) {
    for (const option of category.categoryOptionsList) {
        switch (option.optionType.type) {
            case 'multiRow':
                // Loop through all sub-options in multiRow
                for (const item of option.optionType.options) {
                    const canUse = await (item.allowedCheck ? item.allowedCheck({ guild: { id: guildId }, user: { id: userId } }) : { allowed: true, errorMessage: null });
                    if (typeof canUse !== 'object') {
                        throw new TypeError(`${category.categoryId} category option with id ${item.optionId} allowedCheck function needs to return {allowed: Boolean, errorMessage: String | null}`);
                    }

                    canUseSettings[category.categoryId][item.optionId] = canUse;
                    actualSettings[category.categoryId][item.optionId] = await item.getActualSet({ guild: { id: guildId }, user: { id: userId } }) || (item.optionType.type === 'tagInput' ? [] : null);
                }
                break;
            case "spacer":
                // Return basic spacer object
                actualSettings[category.categoryId][configOption.optionId] = { type: 'spacer', themeOptions: configOption.themeOptions };
                break;
            case "rolesMultiSelect":
            case "channelsMultiSelect":
            case "multiSelect":
            case "tagInput":
            case "tagInput":
                // Return empty array if no data
                actualSettings[category.categoryId][configOption.optionId] = await option.getActualSet({ guild: { id: guildId }, user: { id: userId } }) || [];
                break;
            default:
                // Return data if it exists for all other formTypes, otherwise return null
                const canUse = await (option.allowedCheck ? option.allowedCheck({ guild: { id: guildId }, user: { id: userId } }) : { allowed: true, errorMessage: null });
                if (typeof canUse !== 'object') {
                    throw new TypeError(`${category.categoryId} category option with id ${option.optionId} allowedCheck function needs to return {allowed: Boolean, errorMessage: String | null}`);
                }

                canUseSettings[category.categoryId][option.optionId] = canUse;
                actualSettings[category.categoryId][option.optionId] = await option.getActualSet({ guild: { id: guildId }, user: { id: userId } }) || null;
                break;
        }
    }
}