const fetch = require('node-fetch')
const fs = require('fs')
let DBD = require('discord-dashboard')

module.exports = {
    page: '/debug',
    execute: async (req, res, app, config, themeConfig, info) => {
        /*
                    Do not remove this page.
                    It will be used with support in the discord server.
                */
        if (!req.session.user) return res.redirect('/discord?r=/debug/')
        if (!config.ownerIDs?.includes(req.session.user.id))
            return res.redirect('/')

        let onlineFiles = {
            index: await fetch(
                `https://cdn.jsdelivr.net/gh/Assistants-Center/DBD-Soft-UI/views/index.ejs`
            ),
            guild: await fetch(
                `https://cdn.jsdelivr.net/gh/Assistants-Center/DBD-Soft-UI/views/guild.ejs`
            ),
            guilds: await fetch(
                `https://cdn.jsdelivr.net/gh/Assistants-Center/DBD-Soft-UI/views/guilds.ejs`
            )
        }

        onlineFiles.index = await onlineFiles.index.text()
        onlineFiles.guild = await onlineFiles.guild.text()
        onlineFiles.guilds = await onlineFiles.guilds.text()
        let localFiles = {
            index: await fs.readFileSync(
                `${__dirname}/../..//views/index.ejs`,
                'utf-8'
            ),
            guild: await fs.readFileSync(
                `${__dirname}/../../views/settings.ejs`,
                'utf-8'
            ),
            guilds: await fs.readFileSync(
                `${__dirname}/../../views/guilds.ejs`,
                'utf-8'
            )
        }

        let onlineV = await fetch(
            `https://cdn.jsdelivr.net/gh/Assistants-Center/DBD-Soft-UI/utils/updater/versionsOnline.json`
        )
        const localV = require(`${__dirname}/../../utils/updater/versions.json`)
        onlineV = await onlineV.json()

        res.render('debug', {
            license: require(`discord-dashboard`).licenseInfo().type, // replace with discord-dashboard
            onlineV,
            localV,
            onlineFiles,
            localFiles,
            rawUptime: process.uptime(),
            nodeVersion: process.version,
            themeConfig,
            discordVersion: require('discord.js').version,
            dbdVersion: DBD.version,
            themeVersion: require(`dbd-soft-ui`).version,
            themePartials: require(`${__dirname}/../../utils/updater/versions.json`),
            req,
            config,
            info
        })
    }
}
