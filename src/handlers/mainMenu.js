const T = require('../locales/ru');
const t = require('../locales/ru').mainMenu;
const { getBrands, getCategories } = require('../woo');

function mainMenuHandler(bot) {
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        await bot.answerCallbackQuery(query.id); // відповідаємо одразу

        let subMenu = [];
        let prefix = '';

        try {
            switch (query.data) {
                case 'show_brands':
                    subMenu = await getBrands();
                    prefix = 'brand_';
                    break;
                case 'show_categories':
                    subMenu = await getCategories();
                    subMenu = subMenu.filter(item => item.id !== 15);
                    prefix = 'cat_';
                    break;
                default:
                    return;
            }

            if (!subMenu || subMenu.length === 0) {
                return bot.sendMessage(chatId, t.notFound);
            }

            const chunk = (arr, size) =>
                arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);

            const subMenuKeyboard = {
                reply_markup: {
                    inline_keyboard: chunk(
                        subMenu.map(item => ({
                            text: item.name,
                            callback_data: `${prefix}${item.id}`
                        })),
                        2 // по 2 кнопки в ряд
                    )
                }
            };

            bot.sendMessage(chatId, t.makeChoice, subMenuKeyboard);

        } catch (e) {
            console.error(T.Error, e);
            bot.sendMessage(chatId, t.errorTryAgain);
        }
    });
}

module.exports = mainMenuHandler;