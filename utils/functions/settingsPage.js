const Discord = require('discord.js')
module.exports = function (config, themeConfig) {
    config.guildSettings = async function (req, res, home, category) {
        if (!req.session.user) return res.redirect('/discord?r=/guild/' + req.params.id)

        let bot = config.bot
        if (!bot.guilds.cache.get(req.params.id)) {
            try {
                await bot.guilds.fetch(req.params.id)
            } catch (err) { }
        }

        if (!bot.guilds.cache.get(req.params.id)) return res.redirect('/manage?error=noPermsToManageGuild')
        if (
            !bot.guilds.cache
                .get(req.params.id)
                .members.cache.get(req.session.user.id)
        ) {
            try {
                await bot.guilds.cache
                    .get(req.params.id)
                    .members.fetch(req.session.user.id)
            } catch (err) { }
        }
        for (let PermissionRequired of req.requiredPermissions) {
            let converted = PermissionRequired[0]
            const DiscordJsVersion = Discord.version.split('.')[0]
            if (DiscordJsVersion === '14') converted = await convert14(PermissionRequired[0])

            if (
                !bot.guilds.cache
                    .get(req.params.id)
                    .members.cache.get(req.session.user.id)
                    .permissions.has(converted)
            ) {
                return res.redirect('/manage?error=noPermsToManageGuild')
            }
        }

        if (bot.guilds.cache.get(req.params.id).channels.cache.size < 1) {
            try {
                await bot.guilds.cache.get(req.params.id).channels.fetch()
            } catch (err) { }
        }

        if (bot.guilds.cache.get(req.params.id).roles.cache.size < 2) {
            try {
                await bot.guilds.cache.get(req.params.id).roles.fetch()
            } catch (err) { }
        }

        let actual = {}
        let toggle = {}
        let premium = {}

        let canUseList = {}

        if (config.settings?.length) for (const category of config.settings) {
            if (!canUseList[category.categoryId]) canUseList[category.categoryId] = {};
            if (!actual[category.categoryId]) actual[category.categoryId] = {}

            if (config.useCategorySet) {
                let catGAS = await category.getActualSet({
                    guild: {
                        id: req.params.id,
                        object: bot.guilds.cache.get(req.params.id),
                    },
                    user: {
                        id: req.session.user.id,
                        object: bot.guilds.cache
                            .get(req.params.id)
                            .members.cache.get(req.session.user.id),
                    },
                });

                if (category.toggleable) {
                    if (!toggle[category.categoryId]) {
                        toggle[category.categoryId] = {}
                    }
                    toggle[category.categoryId] = catGAS.find(o => o.optionId === "categoryToggle")?.data || null;
                    catGAS = catGAS.filter((c) => c.optionId !== 'categoryToggle')
                }
                if (category.premium) {
                    if (!premium[category.categoryId]) {
                        premium[category.categoryId] = {}
                    }
                    premium[category.categoryId] = await s.premiumUser({
                        guild: {
                            id: req.params.id
                        },
                        user: {
                            id: req.session.user.id,
                            tag: req.session.user.tag
                        }
                    })
                }

                if (category.premium && premium[category.categoryId] == false) return res.redirect(
                    `/settings/${req.params.id}?error=premiumRequired`
                )


                for (const o of catGAS) {
                    if (!o || !o?.optionId) {
                        console.log(
                            "WARNING: You haven't set the optionId for a category option in your config. This is required for the category option to work."
                        )
                        continue;
                    }
                    const option = category.categoryOptionsList.find(
                        (c) => c.optionId == o.optionId
                    )
                    if (option) {
                        if (option.allowedCheck) {
                            const canUse = await option.allowedCheck({
                                guild: {
                                    id: req.params.id,
                                },
                                user: {
                                    id: req.session.user.id,
                                },
                            })

                            if (typeof canUse != "object")
                                throw new TypeError(
                                    `${category.categoryId} category option with id ${option.optionId} allowedCheck function need to return {allowed: Boolean, errorMessage: String | null}`
                                )
                            canUseList[category.categoryId][
                                option.optionId
                            ] = canUse
                        } else {
                            canUseList[category.categoryId][
                                option.optionId
                            ] = {
                                allowed: true,
                                errorMessage: null,
                            }
                        }

                        if (option.optionType !== "spacer") {
                            if (!actual[category.categoryId]) {
                                actual[category.categoryId] = {}
                            }
                            if (
                                !actual[category.categoryId][
                                option.optionId
                                ]
                            ) {
                                actual[category.categoryId][
                                    option.optionId
                                ] = o.data
                            }
                        } else actual[category.categoryId][option.optionId] = {
                            type: 'spacer',
                            themeOptions: option.themeOptions
                        }
                    } else console.log(`WARNING: Option ${o.optionId} in category ${category.categoryId} doesn't exist in your config.`)

                }
            } else for (const s of config.settings) {
                if (!canUseList[s.categoryId]) canUseList[s.categoryId] = {}
                if (s.toggleable) {
                    if (!toggle[s.categoryId]) {
                        toggle[s.categoryId] = {}
                    }
                    toggle[s.categoryId] = await s.getActualSet({
                        guild: {
                            id: req.params.id
                        }
                    })
                }
                if (s.premium) {
                    if (!premium[s.categoryId]) {
                        premium[s.categoryId] = {}
                    }
                    premium[s.categoryId] = await s.premiumUser({
                        guild: {
                            id: req.params.id
                        },
                        user: {
                            id: req.session.user.id,
                            tag: req.session.user.tag
                        }
                    })
                }

                if (category) {
                    if (s.premium && premium[category] == false) {
                        return res.redirect(
                            `/settings/${req.params.id}?error=premiumRequired`
                        )
                    }
                }

                for (const c of s.categoryOptionsList) {
                    if (c.allowedCheck) {
                        const canUse = await c.allowedCheck({
                            guild: { id: req.params.id },
                            user: { id: req.session.user.id }
                        })
                        if (typeof canUse != 'object') {
                            throw new TypeError(
                                `${s.categoryId} category option with id ${c.optionId} allowedCheck function need to return {allowed: Boolean, errorMessage: String | null}`
                            )
                        }
                        canUseList[s.categoryId][c.optionId] = canUse
                    } else {
                        canUseList[s.categoryId][c.optionId] = {
                            allowed: true,
                            errorMessage: null
                        }
                    }

                    if (!actual[s.categoryId]) actual[s.categoryId] = {}

                    if (c.optionType.type == 'spacer') {
                        actual[s.categoryId][c.optionId] = {
                            type: 'spacer',
                            themeOptions: c.themeOptions
                        }
                    } else if (
                        c.optionType.type == 'collapsable' ||
                        c.optionType.type == 'modal'
                    ) {
                        for (const item of c.optionType.options) {
                            if (
                                item.optionType.type == 'channelsMultiSelect' ||
                                item.optionType.type == 'roleMultiSelect' ||
                                item.optionType.type == 'tagInput'
                            ) {
                                actual[s.categoryId][item.optionId] = []
                            }
                        }
                    } else {
                        if (!actual[s.categoryId]) {
                            actual[s.categoryId] = {}
                        }
                        if (!actual[s.categoryId][c.optionId]) {
                            if (c.optionType.type === "multiRow") {
                                for (const item of c.optionType.options) {
                                    actual[s.categoryId][item.optionId] = await item.getActualSet(
                                        {
                                            guild: {
                                                id: req.params.id,
                                                object: bot.guilds.cache.get(req.params.id)
                                            },
                                            user: {
                                                id: req.session.user.id,
                                                object: bot.guilds.cache
                                                    .get(req.params.id)
                                                    .members.cache.get(req.session.user.id)
                                            }
                                        }
                                    )
                                }
                                continue
                            }
                            actual[s.categoryId][c.optionId] = await c.getActualSet(
                                {
                                    guild: {
                                        id: req.params.id,
                                        object: bot.guilds.cache.get(req.params.id)
                                    },
                                    user: {
                                        id: req.session.user.id,
                                        object: bot.guilds.cache
                                            .get(req.params.id)
                                            .members.cache.get(req.session.user.id)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }

        let errors
        let success
        // boo
        if (req.session.errors) {
            if (String(req.session.errors).includes('%is%')) {
                errors = req.session.errors.split('%and%')
            }
        }

        if (req.session.success) {
            if (typeof req.session.success == 'boolean') {
                success = true
            } else {
                if (String(req.session.success).includes('%is%')) {
                    success = req.session.success.split('%and%')
                }
            }
        }

        req.session.errors = null
        req.session.success = null

        const guild = bot.guilds.cache.get(req.params.id)
        let gIcon

        if (!guild.iconURL()) gIcon = themeConfig?.icons?.noGuildIcon
        else gIcon = guild.iconURL()

        res.render('settings', {
            successes: success,
            errors: errors,
            settings: config.settings,
            actual: actual,
            toggle,
            premium,
            canUseList,
            bot: config.bot,
            guild,
            userid: req.session.user.id,
            gIcon,
            req: req,
            guildid: req.params.id,
            themeConfig: req.themeConfig,
            config
        })
    }
}

async function convert14(perm) {
    var final = 'NULL'

    switch (perm) {
        case 'CREATE_INSTANT_INVITE':
            final = 'CreateInstantInvite'
            break
        case 'KICK_MEMBERS':
            final = 'KickMembers'
            break
        case 'BAN_MEMBERS':
            final = 'BanMembers'
            break
        case 'ADMINISTRATOR':
            final = 'Administrator'
            break
        case 'MANAGE_CHANNELS':
            final = 'ManageChannels'
            break
        case 'MANAGE_GUILD':
            final = 'ManageGuild'
            break
        case 'ADD_REACTIONS':
            final = 'AddReactions'
            break
        case 'VIEW_AUDIT_LOG':
            final = 'ViewAuditLog'
            break
        case 'PRIORITY_SPEAKER':
            final = 'PrioritySpeaker'
            break
        case 'STREAM':
            final = 'Stream'
            break
        case 'VIEW_CHANNEL':
            final = 'ViewChannel'
            break
        case 'SEND_MESSAGES':
            final = 'SendMessages'
            break
        case 'SEND_TTS_MESSAGES':
            final = 'SendTTSMessages'
            break
        case 'MANAGE_MESSAGES':
            final = 'ManageMessages'
            break
        case 'EMBED_LINKS':
            final = 'ManageMessages'
            break
        case 'ATTACH_FILES':
            final = 'AttachFiles'
            break
        case 'READ_MESSAGE_HISTORY':
            final = 'ReadMessageHistory'
            break
        case 'MENTION_EVERYONE':
            final = 'MentionEveryone'
            break
        case 'USE_EXTERNAL_EMOJIS':
            final = 'UseExternalEmojis'
            break
        case 'VIEW_GUILD_INSIGHTS':
            final = 'ViewGuildInsughts'
            break
        case 'CONNECT':
            final = 'Connect'
            break
        case 'SPEAK':
            final = 'Speak'
            break
    }

    return final
}
