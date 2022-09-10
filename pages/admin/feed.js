const db = require('quick.db');
const { icons, otherIcons } = require('../../icons');

module.exports = {
    page: '/feed',
    execute: async (req, res, app, config, themeConfig, info) => {
        console.log(`Feed request, action: ${req.query.action}`)
        if (req.query.action === "delete") {
            const deleteFeed = req.query.feed;
            if (!deleteFeed) return res.redirect("/admin?error=invalidFeed");
            if (!/^\d+$/.test(deleteFeed)) return res.redirect("/admin?error=invalidFeed");
            if (deleteFeed !== '1' && deleteFeed !== '2' && deleteFeed !== '3') return res.redirect("/admin?error=invalidFeed");
            if (deleteFeed === '1') {
                console.log('1')
                if (!db.get('feeds.one')) return res.redirect("/admin?error=invalidFeed");
                if (db.get('feeds.two')) {
                    const f = await db.get('feeds.two')
                    await db.set('feeds.one', {
                        color: f.color,
                        description: f.description,
                        published: f.published,
                        icon: f.icon,
                        diff: f.diff
                    });
                } else {
                    await db.delete('feeds.one');
                }
                if (db.get('feeds.three')) {
                    const f = await db.get('feeds.three')
                    await db.set('feeds.two', {
                        color: f.color,
                        description: f.description,
                        published: f.published,
                        icon: f.icon,
                        diff: f.diff
                    });
                    await db.delete('feeds.three');
                }
            } else if (deleteFeed === '2') {
                console.log('2')
                if (!db.get('feeds.two')) return res.redirect("/admin?error=invalidFeed");
                if (db.get('feeds.one')) {
                    const f = await db.get('feeds.one')
                    await db.set('feeds.two', {
                        color: f.color,
                        description: f.description,
                        published: f.published,
                        icon: f.icon,
                        diff: f.diff
                    });
                    console.log("Set feed 1 to 2")
                    await db.delete('feeds.one');
                    console.log("Deleted feed 1")
                } else {
                    await db.delete('feeds.two');
                    console.log("Deleted feed 2")
                }
            } else if (deleteFeed === '3') {
                console.log('3')
                if (!db.get('feeds.three')) return res.redirect("/admin?error=invalidFeed");
                await db.delete('feeds.three');
                console.log(db.get('feeds.three'))
                console.log("Deleted feed 3")
                if (db.get('feeds.two')) {
                    const f = await db.get('feeds.two')
                    await db.set('feeds.three', {
                        color: f.color,
                        description: f.description,
                        published: f.published,
                        icon: f.icon,
                        diff: f.diff
                    });
                    console.log("Set feed 2 to 3")
                }
                if (db.get('feeds.one')) {
                    const f = await db.get('feeds.one')
                    await db.set('feeds.two', {
                        color: f.color,
                        description: f.description,
                        published: f.published,
                        icon: f.icon,
                        diff: f.diff
                    });
                    console.log("Set feed 1 to 2")
                }
            }
            return res.redirect("/admin");
        } else if (req.query.action === "create") {
            const {
                color,
                description,
                icon
            } = req.query;
            if (!color || !description || !icon) return res.redirect("/admin?error=missingData");
            if (color !== 'red' && color !== 'orange' && color !== 'pink' && color !== 'gray' && color !== 'green' && color !== 'blue' && color !== 'dark') return res.redirect("/admin?error=invalidData");
            if (description.length < 3 || description.length > 128) return res.redirect("/admin?error=invalidData");
            if (!icons.includes(icon) && !otherIcons.includes(icon)) return res.redirect("/admin?error=invalidData");
            let diff;
            let col;
            if (otherIcons.includes(icon)) diff = true;
            if (color === "red") col = "danger";
            if (color === "orange") col = "warning";
            if (color === "pink") col = "primary";
            if (color === "gray") col = "secondary";
            if (color === "green") col = "success";
            if (color === "blue") col = "info";
            if (color === "dark") col = "dark";
            if (db.get('feeds.three') && db.get('feeds.two') && db.get('feeds.one')) {
                await db.delete('feeds.one');
                const f3 = db.get('feeds.three');
                const f2 = db.get('feeds.two');
                await db.set('feeds.two', {
                    color: f3.color,
                    description: f3.description,
                    published: f3.published,
                    icon: f3.icon,
                    diff: f3.diff
                });
                await db.set('feeds.one', {
                    color: f2.color,
                    description: f2.description,
                    published: f2.published,
                    icon: f2.icon,
                    diff: f2.diff
                });
                await db.set('feeds.three', {
                    color: col,
                    description: description,
                    published: Date.now(),
                    icon: icon,
                    diff: diff
                });
            } else {
                if (!db.get('feeds.three')) await db.set('feeds.three', {
                    color: col,
                    description: description,
                    published: Date.now(),
                    icon: icon,
                    diff: diff
                });
                else if (!db.get('feeds.two')) {
                    const f3 = db.get('feeds.three');
                    await db.set('feeds.two', {
                        color: f3.color,
                        description: f3.description,
                        published: f3.published,
                        icon: f3.icon,
                        diff: f3.diff
                    });
                    await db.set('feeds.three', {
                        color: col,
                        description: description,
                        published: Date.now(),
                        icon: icon,
                        diff: diff
                    });
                } else {
                    const f3 = db.get('feeds.three');
                    const f2 = db.get('feeds.two');
                    await db.set('feeds.one', {
                        color: f2.color,
                        description: f2.description,
                        published: f2.published,
                        icon: f2.icon,
                        diff: f2.diff
                    });
                    await db.set('feeds.two', {
                        color: f3.color,
                        description: f3.description,
                        published: f3.published,
                        icon: f3.icon,
                        diff: f3.diff
                    });
                    await db.set('feeds.three', {
                        color: col,
                        description: description,
                        published: Date.now(),
                        icon: icon,
                        diff: diff
                    });
                }
            }
            return res.redirect("/admin");
        }
    }
}