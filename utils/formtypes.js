module.exports = {
    slider: (min, max, step, disabled, themeOptions = {}) => {
        return {
            type: "slider",
            min,
            max,
            step,
            disabled,
            themeOptions,
        }
    },
    date: (disabled, themeOptions = {}) => {
        return {
            type: "date",
            disabled,
            themeOptions,
        }
    },
    numberPicker: (disabled, themeOptions = {}) => {
        return {
            type: "numberPicker",
            disabled,
            themeOptions,
        }
    },
    tagInput: (disabled, themeOptions = {}) => {
        return {
            type: "tagInput",
            disabled,
            themeOptions,
        }
    },
}
