module.exports = {
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