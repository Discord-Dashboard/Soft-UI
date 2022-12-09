module.exports = (commands, prefix) => {
    if (!commands)
        throw new Error('No commands were provided to the Soft UI cmdHandler.')
    if (!prefix) prefix = '!'

    let finalCategories = []
    let categories = []

    for (const command of commands) {
        if (!command.category) continue
        if (!categories?.includes(command.category))
            categories.push(command.category)
    }

    for (const category of categories) {
        if (
            category === 'admin' ||
            category === 'owner' ||
            category === 'development'
        )
            continue
        let commandsArr = []

        for (const command of commands) {
            if (command.category === category) {
                let obj = {
                    commandName: command.name,
                    commandUsage: `${prefix}${command.name} ${command.usage}`,
                    commandDescription: command.description,
                    commandAlias: command.aliases?.join(', ') || 'None'
                }
                commandsArr.push(obj)
            }
        }

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
