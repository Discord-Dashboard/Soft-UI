module.exports = {
    multiRow: (options) => {
        // Validate Data
        if (options && (!options.length || !options[0])) throw new Error("Options in the 'collapsable' form type should be an array.");

        const hasType = (object) => object.hasOwnProperty('optionType') && object.optionType?.hasOwnProperty('type');

        if (options && !options.every(hasType)) throw new Error("Invalid form type provided in the 'multiRow' form type.");

        if (options && options.find(obj => obj.optionType.type == "multiRow")) throw new Error("You cannot use the form type 'multiRow' in the 'multiRow' form type.");

        return {
            type: "multiRow",
            options
        }
    },
    spacer: (themeOptions = {}) => {
        return {
            type: 'spacer',
            themeOptions
        }
    },
    emojiPicker: (disabled, themeOptions = {}) => {
        return {
            type: 'emojiPicker',
            disabled,
            themeOptions
        }
    },
    slider: (min, max, step, disabled, themeOptions = {}) => {
        return {
            type: 'slider',
            min,
            max,
            step,
            disabled,
            themeOptions
        }
    },
    date: (disabled, themeOptions = {}) => {
        return {
            type: 'date',
            disabled,
            themeOptions
        }
    },
    numberPicker: (min, max, disabled, themeOptions = {}) => {
        return {
            type: 'numberPicker',
            min,
            max,
            disabled,
            themeOptions
        }
    },
    tagInput: (disabled, themeOptions = {}) => {
        return {
            type: 'tagInput',
            disabled,
            themeOptions
        }
    }
}