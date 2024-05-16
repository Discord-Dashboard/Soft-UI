const { PermissionsBitField } = require("discord.js");

module.exports = {
    page: '/guild/update/:guildId/',
    execute: async (req, res, app, config, themeConfig, info) => {
        const data = req.body;

        let errors = [];
        let successes = [];

        if (!req.session?.user) {
            return res.send({
                success: false,
                message: 'User is not logged in'
            });
        }

        const user = {
            id: req.session.user.id,
            object: config.bot.guilds.cache
                .get(req.params.guildId)
                .members.cache.get(req.session.user.id)
        }

        const guild = {
            id: req.params.guildId,
            object: config.bot.guilds.cache.get(req.params.guildId)
        }

        const userGuildMemberObject = guild?.object?.members?.cache?.get(req.session.user.id);

        if(!userGuildMemberObject) return res.send({
                success: false,
                message: 'No access'
            });

        if(!userGuildMemberObject.permissions.has(PermissionsBitField.Flags.ManageGuild)) return res.send({
                success: false,
                message: 'No access'
            });

        const categorySet = {};

        const category = config.settings?.find(category => category.categoryId == req.query.categoryId);
        if (!category) {
            errors.push(`Failed to load category ${req.query.categoryId}`);
        }

        const childFormTypes = category.categoryOptionsList
            .filter(option => option.optionType.type == "multiRow")
            .flatMap(option => option.optionType.options);

        const options = [
            ...category.categoryOptionsList.filter(option => option.optionType.type != "multiRow"),
            ...childFormTypes
        ];

        // Check if the user has turned a category on or off
        if (data?.categoryToggle && data.categoryToggle.length > 0) {
            const categories = config.settings.filter(category => data.categoryToggle.find(toggle => toggle.id == category.categoryId));

            const premiumList = await Promise.all(categories.map(async category => {
                if (category.premium && !category.premiumUser({ user, guild })) {
                    console.log(`Category ${category.categoryId} requires a premiumUser method when setting premium`);
                }

                return {
                    id: category.categoryId,
                    isPremium: category.premium ? await category.premiumUser({ user, guild }) : false
                }
            }));


            for (const toggleCat of data.categoryToggle) {
                const category = categories.find(cat => cat.categoryId == toggleCat.id);

                if (!category) {
                    errors.push(`Failed to load category ${toggleCat.id}`);
                    continue;
                }

                if (category.premium && !premiumList.find(premium => premium.id == category.categoryId).isPremium) {
                    errors.push(`Category ${category.categoryId} requires premium`);
                    continue;
                }

                try {
                    if (config?.useCategorySet) {
                        if (!categorySet[toggleCat.id])
                            categorySet[toggleCat.id] = [];
                        categorySet[toggleCat.id] = [...categorySet[toggleCat.id], {
                            optionId: "categoryToggle",
                            data: toggleCat.value
                        }]
                    } else category.setNew({ guild, user, newData: toggleCat.value });
                } catch (error) {
                    console.log(error)
                    errors.push(`Failed to set category ${toggleCat.id} to ${toggleCat.value}`);
                    continue
                }
            }
        }

        // Check if the user has changed a setting
        if (data?.options && data.options.length > 0) {
            const category = config.settings?.find(category => category.categoryId == req.query.categoryId);
            if (!category) {
                errors.push(`Failed to load category ${req.query.categoryId}`);
            }

            const premium = category.premium ? await category.premiumUser({ user, guild }) : false;

            const filtered = options.filter(option => data.options.find(opt => opt.id == option.optionId));
            const allowed = await Promise.all(filtered.map(async option => {
                return option.allowedCheck ? {
                    ...option.allowedCheck({
                        guild: { id: req.params.guildId },
                        user: { id: req.session.user.id }
                    }),
                    optionId: option.optionId
                } : { allowed: true, optionId: option.optionId, errorMessage: null };
            }));

            for (const option of data.options) {
                const setting = filtered.find(opt => opt.optionId == option.id);
                if (!setting) {
                    errors.push(`Failed to load setting ${option.id}`);
                    continue;
                }

                const allow = allowed.find(allowed => allowed.optionId == option.id);
                if (!allow.allowed) {
                    errors.push(allow.errorMessage);
                    continue;
                }

                let item;

                switch (setting.optionType.type) {
                    case "rolesMultiSelect":
                    case "channelsMultiSelect":
                    case "multiSelect":
                    case "tagInput":
                        item = {
                            optionId: setting.optionId,
                            data: Array.isArray(option.value) ? option.value : [option.value]
                        };
                        break;
                    case "switch":
                        item = {
                            optionId: setting.optionId,
                            data: option.value ?? false
                        };
                        break;
                    case "embedBuilder":
                        try {
                            const parsedResponse = JSON.parse(option.value);
                            item = {
                                optionId: setting.optionId,
                                data: parsedResponse
                            };
                        } catch (err) {
                            item = {
                                optionId: setting.optionId,
                                data: option.optionType.data
                            };
                        }
                        break;
                    default:
                        console.log(setting.optionType.type, option.value)
                        item = {
                            optionId: setting.optionId,
                            data: option.value ?? null
                        };
                        break;
                }

                try {
                    if (config?.useCategorySet) {
                        if (!categorySet[req.query.categoryId])
                            categorySet[req.query.categoryId] = [];

                        categorySet[req.query.categoryId] = [...categorySet[req.query.categoryId], item]
                    } else setting.setNew({ guild, user, newData: item.data });
                } catch (error) {
                    console.log(error)
                    errors.push(`Failed to set setting ${option.id} to ${option.value}`);
                    continue;
                }
            }

            if (category.premium && !premium) {
                errors.push(`Category ${category.categoryId} requires premium`);
            }
        }

        req.DBDEvents.emit('guildSettingsUpdated', {
            user: req.session.user,
            changes: { successes, errors }
        });

        if (errors.length === 0)
            for (const [category, data] of Object.entries(categorySet)) {
                try {
                    config.settings.find(cat => cat.categoryId == category).setNew({ guild, user, newData: data });

                    data.forEach(o => successes.push(`Successfully saved ${o.optionId} to ${o.value} in category ${category}`));
                } catch (error) {
                    console.log(error);
                    errors.push(`Failed to save changes to ${category}`);
                };
            };

        return res.send({
            success: errors.length === 0,
            message: errors.length === 0 ? 'Successfully saved changes' : 'Failed to save changes',
            errors,
            successes
        });
    }
};
