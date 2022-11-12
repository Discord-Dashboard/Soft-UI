const db = require("quick.db")
const consolePrefix = `${"[".blue}${"dbd-soft-ui".yellow}${"]".blue} `
const colors = require("colors")
const { icons, otherIcons } = require("../icons")

module.exports = class Feed {
    constructor() {
        this.setColor = function (color) {
            if (!color)
                throw new Error(
                    `${consolePrefix}${
                        `Failed to modify feed. ${colors.red("Invalid color.")}`
                            .cyan
                    }`
                )
            if (
                color !== "red" &&
                color !== "orange" &&
                color !== "pink" &&
                color !== "gray" &&
                color !== "green" &&
                color !== "blue" &&
                color !== "dark"
            )
                throw new Error(
                    `${consolePrefix}${
                        `Failed to modify feed. ${colors.red("Invalid color.")}`
                            .cyan
                    }`
                )

            this.color = color

            return this
        }
        this.setDescription = function (description) {
            if (!description)
                throw new Error(
                    `${consolePrefix}${
                        `Failed to modify feed. ${colors.red(
                            "Invalid description."
                        )}`.cyan
                    }`
                )
            if (description.length < 3 || description.length > 128)
                console.log(`${consolePrefix}${"Invalid description".cyan}`)

            this.description = description

            return this
        }
        this.setIcon = function (icon) {
            if (!icon)
                throw new Error(
                    `${consolePrefix}${
                        `Failed to modify feed. ${colors.red("Invalid icon.")}`
                            .cyan
                    }`
                )
            if (!icons.includes(icon) && !otherIcons.includes(icon))
                throw new Error(
                    `${consolePrefix}${
                        `Failed to modify feed. ${colors.red("Invalid icon.")}`
                            .cyan
                    }`
                )

            this.icon = icon

            return this
        }

        this.getFeed = function (id) {
            if (!id)
                throw new Error(
                    `${consolePrefix}${
                        `Failed to get feed. ${colors.red("Invalid id.")}`.cyan
                    }`
                )

            let feedName = ""
            switch (id) {
                case 1:
                    feedName = "one"
                    break
                case 2:
                    feedName = "two"
                    break
                case 3:
                    feedName = "three"
                    break
                default:
                    throw new Error(
                        `${consolePrefix}${
                            `Failed to get feed. ${colors.red("Invalid id.")}`
                                .cyan
                        }`
                    )
            }

            let feed = db.get(`feeds.${feedName}`)
            if (!feed)
                throw new Error(
                    `${consolePrefix}${
                        `Failed to get feed. ${colors.red("Feed not found.")}`
                            .cyan
                    }`
                )

            this.feed = feed
            return this
        }

        this.delete = function () {
            if (!this.feed)
                throw new Error(
                    `${consolePrefix}${
                        `Failed to delete feed. ${colors.red(
                            "Feed not selected"
                        )}`.cyan
                    }`
                )

            db.delete(`feeds.${this.feed.id}`)

            return this
        }
        this.send = async function () {
            const { color, description, icon } = this

            let diff
            let col
            if (otherIcons.includes(icon)) diff = true

            if (color === "red") col = "danger"
            if (color === "orange") col = "warning"
            if (color === "pink") col = "primary"
            if (color === "gray") col = "secondary"
            if (color === "green") col = "success"
            if (color === "blue") col = "info"
            if (color === "dark") col = "dark"

            if (
                db.get("feeds.three") &&
                db.get("feeds.two") &&
                db.get("feeds.one")
            ) {
                await db.delete("feeds.one")
                const f3 = db.get("feeds.three")
                const f2 = db.get("feeds.two")
                await db.set("feeds.two", {
                    color: f3.color,
                    description: f3.description,
                    published: f3.published,
                    icon: f3.icon,
                    diff: f3.diff,
                })
                await db.set("feeds.one", {
                    color: f2.color,
                    description: f2.description,
                    published: f2.published,
                    icon: f2.icon,
                    diff: f2.diff,
                })
                await db.set("feeds.three", {
                    color: col,
                    description: description,
                    published: Date.now(),
                    icon: icon,
                    diff: diff,
                })
            } else {
                if (!db.get("feeds.three"))
                    await db.set("feeds.three", {
                        color: col,
                        description: description,
                        published: Date.now(),
                        icon: icon,
                        diff: diff,
                    })
                else if (!db.get("feeds.two")) {
                    const f3 = db.get("feeds.three")
                    await db.set("feeds.two", {
                        color: f3.color,
                        description: f3.description,
                        published: f3.published,
                        icon: f3.icon,
                        diff: f3.diff,
                    })
                    await db.set("feeds.three", {
                        color: col,
                        description: description,
                        published: Date.now(),
                        icon: icon,
                        diff: diff,
                    })
                } else {
                    const f3 = db.get("feeds.three")
                    const f2 = db.get("feeds.two")
                    await db.set("feeds.one", {
                        color: f2.color,
                        description: f2.description,
                        published: f2.published,
                        icon: f2.icon,
                        diff: f2.diff,
                    })
                    await db.set("feeds.two", {
                        color: f3.color,
                        description: f3.description,
                        published: f3.published,
                        icon: f3.icon,
                        diff: f3.diff,
                    })
                    await db.set("feeds.three", {
                        color: col,
                        description: description,
                        published: Date.now(),
                        icon: icon,
                        diff: diff,
                    })
                }
            }
        }
    }
}
