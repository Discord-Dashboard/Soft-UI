module.exports = (commands, prefix) => {
    if (!commands) throw new Error('No commands were provided to the Soft UI cmdHandler.')
    if (!prefix) prefix = '!'

    let finalCategories = []
    let categories = []

    commands.map((cmd) => {
        if (!categories.includes(cmd.category)) {
            categories.push(cmd.category)
        }
    })

    for (const category of categories) {
        if (
            category === 'admin' ||
            category === 'owner' ||
            category === 'development'
        )
            continue
        let commandsArr = []

        commands
            .filter((cmd) => cmd.category === category)
            .map((cmd) => {
                let obj = {
                    commandName: cmd.name,
                    commandUsage: `${cmd.usage ? cmd.usage : `${prefix}${cmd.name}`}`,
                    commandDescription: cmd.description,
                    commandAlias: cmd.aliases?.join(', ') || 'None'
                }
                commandsArr.push(obj)
            })


        const categoryObj = {
            categoryId: category,
            category: `${capitalizeFirstLetter(category)}`,
            subTitle: `${capitalizeFirstLetter(category)} commands`,
            list: commandsArr
        }

        finalCategories.push(categoryObj)
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    return finalCategories
}
