const { getCategories } = require('../woo');

function categoriesHandler(bot) {
    bot.on('callback_query', async (query) => {
        if (query.data === 'show_categories') {
            const chatId = query.message.chat.id;

            const brands = await getCategories();

            if (!brands.length) {
                return bot.sendMessage(chatId, '😔 Категорий не найдено.');
            }

            const categoryKeyboard = {
                reply_markup: {
                    inline_keyboard: brands.map(b => [
                        { text: b.name, callback_data: `cat_${b.id}` }
                    ])
                }
            };

            bot.sendMessage(chatId, 'Выберите категорию:', categoryKeyboard);
            bot.answerCallbackQuery(query.id);
        }
    });
}

module.exports = categoriesHandler;