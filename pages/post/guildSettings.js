module.exports = {
    page: '/guild/update/:guildId/',
    execute: async (req, res, app, config, themeConfig, info) => {
        const data = req.body

        let setNewRes
        let errors = []
        let successes = []

        if (!req.session?.user)
            return res.send({
                success: false,
                message: 'User is not logged in'
            })

        const userGuildMemberObject = config.bot.guilds.cache
            .get(req.params.guildId)
            .members.cache.get(req.session.user.id)
        const guildObject = config.bot.guilds.cache.get(req.params.guildId)

        let category = config.settings?.find((c) => c.categoryId == req.query.categoryId)

        let catO = [];
        let catToggle = [];

        if (data.categoryToggle) {
            for (const s of data.categoryToggle) {
                if (!config.useCategorySet) try {
                    let category = config.settings?.find(
                        (c) => c?.categoryId == s.id
                    )
                    await category.setNew({
                        guild: { id: req.params.guildId },
                        newData: s.value
                    })
                } catch (err) {
                    errors.push(`Category ${s.id} %is%Failed to save%is%categoryToggle`);
                }
                else {
                    if (category?.categoryId == s.id) catO.push({
                        optionId: category.categoryId == s.id ? "categoryToggle" : s.id,
                        data: s.value
                    });
                    else catToggle.push({
                        optionId: s.id,
                        data: s.value
                    });
                }
            }
            if ("categoryToggle" in data && !category) {
                return res.send({
                    success: true,
                    message: "Saved toggle",
                    errors: [],
                    successes: [],
                })
            }
        }

        if (!category)
            return res.send({
                error: true,
                message: "No category found",
            })

        const subOptions = category.categoryOptionsList.filter((o) => o.optionType.type == "multiRow")
            .map((o) => o.optionType.options)
            .flat()

        const newOptionsList = [
            ...category.categoryOptionsList.filter((o) => o.optionType.type != "multiRow"),
            ...subOptions
        ]

        if (data.options) for (let option of newOptionsList) {
            let d = data.options.find((o) => o.id === option.optionId);
            let canUse = {}

            if (!d && !d?.id) continue;

            if (option.allowedCheck) canUse = await option.allowedCheck({
                guild: { id: req.params.guildId },
                user: { id: req.session.user.id },
            })
            else canUse = { allowed: true, errorMessage: null }


            if (canUse.allowed == false) {
                setNewRes = { error: canUse.errorMessage }
                errors.push(
                    option.optionName +
                    "%is%" +
                    setNewRes.error +
                    "%is%" +
                    option.optionId
                )
            } else if (option.optionType != "spacer") {
                if (config.useCategorySet) {
                    if (option.optionType.type == "rolesMultiSelect" || option.optionType.type == "channelsMultiSelect" || option.optionType.type == "multiSelect" || option.optionType.type == 'tagInput') {
                        if (!d.value || d.value == null || d.value == undefined) catO.push({
                            optionId: option.optionId,
                            data: [],
                        })
                        else if (typeof d.value != "object") catO.push({
                            optionId: option.optionId,
                            data: [d.value],
                        })
                        else catO.push({
                            optionId: option.optionId,
                            data: d.value,
                        })
                    } else if (option.optionType.type == "switch") {
                        if (
                            d.value ||
                            d.value == null ||
                            d.value == undefined ||
                            d.value == false
                        ) {
                            if (d.value || d.value == null || d.value == undefined || d.value == false) {
                                if (d.value == null || d.value == undefined || d.value == false)
                                    catO.push({
                                        optionId: option.optionId,
                                        data: false
                                    });
                                else
                                    catO.push({
                                        optionId: option.optionId,
                                        data: true
                                    });
                            }
                        }
                    } else if (option.optionType.type == "embedBuilder") {
                        if (
                            d.value == null ||
                            d.value == undefined
                        )
                            catO.push({
                                optionId: option.optionId,
                                data: option.optionType.data,
                            })
                        else {
                            try {
                                const parsedResponse = JSON.parse(
                                    d.value
                                )
                                catO.push({
                                    optionId: option.optionId,
                                    data: parsedResponse,
                                })
                            } catch (err) {
                                catO.push({
                                    optionId: option.optionId,
                                    data: option.optionType.data,
                                })
                            }
                        }
                    } else {
                        if (
                            d.value == undefined ||
                            d.value == null
                        )
                            catO.push({
                                optionId: option.optionId,
                                data: null,
                            })
                        else
                            catO.push({
                                optionId: option.optionId,
                                data: d.value,
                            })
                    }
                } else {
                    if (
                        option.optionType.type ==
                        'rolesMultiSelect' ||
                        option.optionType.type ==
                        'channelsMultiSelect' ||
                        option.optionType.type == 'multiSelect' ||
                        option.optionType.type == 'tagInput'
                    ) {
                        if (
                            !d.value ||
                            d.value == null ||
                            d.value == undefined
                        ) {
                            setNewRes = await option.setNew({
                                guild: {
                                    id: req.params.guildId,
                                    object: guildObject
                                },
                                user: {
                                    id: req.session.user.id,
                                    object: userGuildMemberObject
                                },
                                newData: []
                            })
                            setNewRes ? null : (setNewRes = {})
                            if (setNewRes.error) {
                                errors.push(
                                    option.optionName +
                                    '%is%' +
                                    setNewRes.error +
                                    '%is%' +
                                    option.optionId
                                )
                            } else {
                                successes.push(option.optionName)
                            }
                        } else if (
                            typeof d.value != 'object'
                        ) {
                            setNewRes = await option.setNew({
                                guild: {
                                    id: req.params.guildId,
                                    object: guildObject
                                },
                                user: {
                                    id: req.session.user.id,
                                    object: userGuildMemberObject
                                },
                                newData: [d.value]
                            })
                            setNewRes ? null : (setNewRes = {})
                            if (setNewRes.error) {
                                errors.push(
                                    option.optionName +
                                    '%is%' +
                                    setNewRes.error +
                                    '%is%' +
                                    option.optionId
                                )
                            } else {
                                successes.push(option.optionName)
                            }
                        } else {
                            setNewRes = await option.setNew({
                                guild: {
                                    id: req.params.guildId,
                                    object: guildObject
                                },
                                user: {
                                    id: req.session.user.id,
                                    object: userGuildMemberObject
                                },
                                newData: d.value
                            })
                            setNewRes ? null : (setNewRes = {})
                            if (setNewRes.error) {
                                errors.push(
                                    option.optionName +
                                    '%is%' +
                                    setNewRes.error +
                                    '%is%' +
                                    option.optionId
                                )
                            } else {
                                successes.push(option.optionName)
                            }
                        }
                    } else if (
                        option.optionType.type == 'embedBuilder'
                    ) {
                        if (
                            d.value !== null ||
                            d.value !== undefined
                        ) {
                            setNewRes =
                                (await option.setNew({
                                    guild: {
                                        id: req.params.guildId,
                                        object: guildObject
                                    },
                                    user: {
                                        id: req.session.user.id,
                                        object: userGuildMemberObject
                                    },
                                    newData: JSON.parse(
                                        d.value
                                    )
                                })) || {}
                            setNewRes ? null : (setNewRes = {})
                            if (setNewRes.error) {
                                errors.push(
                                    option.optionName +
                                    '%is%' +
                                    setNewRes.error +
                                    '%is%' +
                                    option.optionId
                                )
                            } else {
                                successes.push(option.optionName)
                            }
                        } else {
                            try {
                                const parsedResponse = JSON.parse(
                                    d.value
                                )
                                setNewRes =
                                    (await option.setNew({
                                        guild: {
                                            id: req.params.guildId,
                                            object: guildObject
                                        },
                                        user: {
                                            id: req.session.user.id,
                                            object: userGuildMemberObject
                                        },
                                        newData: parsedResponse
                                    })) || {}
                                setNewRes ? null : (setNewRes = {})
                                if (setNewRes.error) {
                                    errors.push(
                                        option.optionName +
                                        '%is%' +
                                        setNewRes.error +
                                        '%is%' +
                                        option.optionId
                                    )
                                } else {
                                    successes.push(
                                        option.optionName
                                    )
                                }
                            } catch (err) {
                                setNewRes =
                                    (await option.setNew({
                                        guild: {
                                            id: req.params.guildId,
                                            object: guildObject
                                        },
                                        user: {
                                            id: req.session.user.id,
                                            object: userGuildMemberObject
                                        },
                                        newData:
                                            option.optionType.data
                                    })) || {}
                                setNewRes = {
                                    error: 'JSON parse for embed builder went wrong, your settings have been reset.'
                                }
                                if (setNewRes.error) {
                                    errors.push(
                                        option.optionName +
                                        '%is%' +
                                        setNewRes.error +
                                        '%is%' +
                                        option.optionId
                                    )
                                } else {
                                    successes.push(
                                        option.optionName
                                    )
                                }
                            }
                        }
                    } else {
                        if (
                            d.value == undefined ||
                            d.value == null
                        ) {
                            setNewRes =
                                (await option.setNew({
                                    guild: {
                                        id: req.params.guildId,
                                        object: guildObject
                                    },
                                    user: {
                                        id: req.session.user.id,
                                        object: userGuildMemberObject
                                    },
                                    newData: null
                                })) || {}
                            setNewRes ? null : (setNewRes = {})
                            if (setNewRes.error) {
                                errors.push(
                                    option.optionName +
                                    '%is%' +
                                    setNewRes.error +
                                    '%is%' +
                                    option.optionId
                                )
                            } else {
                                successes.push(option.optionName)
                            }
                        } else {
                            setNewRes =
                                (await option.setNew({
                                    guild: {
                                        id: req.params.guildId,
                                        object: guildObject
                                    },
                                    user: {
                                        id: req.session.user.id,
                                        object: userGuildMemberObject
                                    },
                                    newData: d.value
                                })) || {}
                            setNewRes ? null : (setNewRes = {})
                            if (setNewRes.error) {
                                errors.push(
                                    option.optionName +
                                    '%is%' +
                                    setNewRes.error +
                                    '%is%' +
                                    option.optionId
                                )
                            } else {
                                successes.push(option.optionName)
                            }
                        }
                    }
                }
            }
        }

        if (config.useCategorySet && catO.length) {
            let sNR = await category.setNew({
                guild: {
                    id: req.params.guildId,
                    object: guildObject,
                },
                user: {
                    id: req.session.user.id,
                    object: userGuildMemberObject,
                },
                data: catO,
            })
            sNR ? null : (sNR = {})
            if (sNR.error) {
                errors.push(category.categoryId + "%is%" + sNR.error)
            } else {
                successes.push(category.categoryId)
            }
        }

        if (config.useCategorySet && catToggle.length) for (const opt of catToggle) {
            let cat = config.settings?.find((c) => c.categoryId == opt.optionId);

            if (!cat) {
                errors.push(`Category ${opt.optionId} %is%Doesn't exist%is%categoryToggle`);
                continue;
            }

            try {
                await cat.setNew({
                    guild: {
                        id: req.params.guildId,
                        object: guildObject,
                    },
                    user: {
                        id: req.session.user.id,
                        object: userGuildMemberObject,
                    },
                    data: [{
                        optionId: "categoryToggle",
                        data: opt.data
                    }],
                });
            } catch (err) {
                errors.push(`Category ${opt.optionId} %is%${err}%is%categoryToggle`);
            }
        }

        req.DBDEvents.emit('guildSettingsUpdated', {
            user: req.session.user,
            changes: { successes, errors },
            guildId: req.guildId
        })

        res.send({
            success: true,
            message: 'saved changed',
            errors,
            successes
        })
    }
}
