module.exports = {
    page: '/guild/update/:guildId/',
    execute: async (req, res, app, config, themeConfig, info) => {
        const data = req.body;

        const categoryId = req.query.categoryId

        let setNewRes;
        let errors = [];
        let successes = [];

        if (!req.session?.user) return res.send({success: false, message: "User is not logged in"})

        const userGuildMemberObject = config.bot.guilds.cache.get(req.params.guildId).members.cache.get(req.session.user.id);
        const guildObject = config.bot.guilds.cache.get(req.params.guildId);

        for (const s of config.settings) {
            try {
                if (categoryId !== s.categoryId) continue;
                for (const option of s.categoryOptionsList) {
                    let canUse = {};

                    if (data.options) {
                        let parsedOption = data.options.find(o => o.id === option.optionId)
                        if (parsedOption) {
                            if (option.allowedCheck) {
                                canUse = await option.allowedCheck({
                                    guild: { id: req.params.guildId },
                                    user: { id: req.session.user.id }
                                });
                            } else {
                                canUse = { allowed: true, errorMessage: null };
                            }

                            if (canUse.allowed == false) {
                                setNewRes = { error: canUse.errorMessage }
                                errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                            } else {
                                if (option.optionType == "spacer") {

                                } else if (option.optionType.type == "rolesMultiSelect" || option.optionType.type == 'channelsMultiSelect' || option.optionType.type == 'multiSelect' || option.optionType.type == 'tagInput') {
                                    if (!parsedOption.value || parsedOption.value == null || parsedOption.value == undefined) {
                                        setNewRes = await option.setNew({
                                            guild: {
                                                id: req.params.guildId,
                                                object: guildObject,
                                            },
                                            user: {
                                                id: req.session.user.id,
                                                object: userGuildMemberObject,
                                            },
                                            newData: []
                                        });
                                        setNewRes ? null : setNewRes = {};
                                        if (setNewRes.error) {
                                            errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                        } else {
                                            successes.push(option.optionName);
                                        }
                                    } else if (typeof (parsedOption.value) != 'object') {
                                        setNewRes = await option.setNew({
                                            guild: {
                                                id: req.params.guildId,
                                                object: guildObject,
                                            },
                                            user: {
                                                id: req.session.user.id,
                                                object: userGuildMemberObject,
                                            },
                                            newData: [parsedOption.value]
                                        });
                                        setNewRes ? null : setNewRes = {};
                                        if (setNewRes.error) {
                                            errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                        } else {
                                            successes.push(option.optionName);
                                        }
                                    } else {
                                        setNewRes = await option.setNew({
                                            guild: {
                                                id: req.params.guildId,
                                                object: guildObject,
                                            },
                                            user: {
                                                id: req.session.user.id,
                                                object: userGuildMemberObject,
                                            },
                                            newData: parsedOption.value
                                        });
                                        setNewRes ? null : setNewRes = {};
                                        if (setNewRes.error) {
                                            errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                        } else {
                                            successes.push(option.optionName);
                                        }
                                    }
                                } else if (option.optionType.type == "embedBuilder") {
                                    if (parsedOption.value !== null || parsedOption.value !== undefined) {
                                        setNewRes = await option.setNew({
                                            guild: {
                                                id: req.params.guildId,
                                                object: guildObject,
                                            },
                                            user: {
                                                id: req.session.user.id,
                                                object: userGuildMemberObject,
                                            },
                                            newData: JSON.parse(parsedOption.value)
                                        }) || {};
                                        setNewRes ? null : setNewRes = {};
                                        if (setNewRes.error) {
                                            errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                        } else {
                                            successes.push(option.optionName);
                                        }
                                    } else {
                                        try {
                                            const parsedResponse = JSON.parse(parsedOption.value);
                                            setNewRes = await option.setNew({
                                                guild: {
                                                    id: req.params.guildId,
                                                    object: guildObject,
                                                },
                                                user: {
                                                    id: req.session.user.id,
                                                    object: userGuildMemberObject,
                                                },
                                                newData: parsedResponse
                                            }) || {};
                                            setNewRes ? null : setNewRes = {};
                                            if (setNewRes.error) {
                                                errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                            } else {
                                                successes.push(option.optionName);
                                            }
                                        } catch (err) {
                                            setNewRes = await option.setNew({
                                                guild: {
                                                    id: req.params.guildId,
                                                    object: guildObject,
                                                },
                                                user: {
                                                    id: req.session.user.id,
                                                    object: userGuildMemberObject,
                                                },
                                                newData: option.optionType.data
                                            }) || {};
                                            setNewRes = { error: 'JSON parse for embed builder went wrong, your settings have been reset.' }
                                            if (setNewRes.error) {
                                                errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                            } else {
                                                successes.push(option.optionName);
                                            }
                                        }
                                    }
                                } else {
                                    if (parsedOption.value == undefined || parsedOption.value == null) {
                                        setNewRes = await option.setNew({
                                            guild: {
                                                id: req.params.guildId,
                                                object: guildObject,
                                            },
                                            user: {
                                                id: req.session.user.id,
                                                object: userGuildMemberObject,
                                            },
                                            newData: null
                                        }) || {};
                                        setNewRes ? null : setNewRes = {};
                                        if (setNewRes.error) {
                                            errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                        } else {
                                            successes.push(option.optionName);
                                        }
                                    } else {
                                        setNewRes = await option.setNew({
                                            guild: {
                                                id: req.params.guildId,
                                                object: guildObject,
                                            },
                                            user: {
                                                id: req.session.user.id,
                                                object: userGuildMemberObject,
                                            },
                                            newData: parsedOption.value
                                        }) || {};
                                        setNewRes ? null : setNewRes = {};
                                        if (setNewRes.error) {
                                            errors.push(option.optionName + '%is%' + setNewRes.error + '%is%' + option.optionId);
                                        } else {
                                            successes.push(option.optionName);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                return res.send({
                    success: false,
                    message: `An error occured: ${err}`
                });
            }
        }

        if (data.categoryToggle) {
            for (const s of data.categoryToggle) {
                try {
                    let category = config.settings.find(c => c?.categoryId == s.id)
                    await category.setNew({
                        guild: { id: req.params.guildId },
                        newData: s.value,
                    })
                } catch (err) {
                    return res.send({
                        success: false,
                        message: `An error occured: ${err}`
                    });
                }
            }
        }

        req.DBDEvents.emit('guildSettingsUpdated', {
            user: req.session.user,
            changes: {successes, errors}
        });

        res.send({
            success: true,
            message: 'saved changed'
        });
    }
}