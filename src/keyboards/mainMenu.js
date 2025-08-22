const T = require('../locales/ru');

const mainMenu = {
    inline_keyboard: [
        [{ text: T.Brands, callback_data: 'show_brands' }],
        [{ text: T.Categories, callback_data: 'show_categories' }],
    ]
}
module.exports = mainMenu;
