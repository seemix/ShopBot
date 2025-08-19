const { getBrands } = require('../woo');

function brandsHandler(bot) {
    bot.on('callback_query', async (query) => {
        if (query.data === 'show_brands') {
            const chatId = query.message.chat.id;

            const brands = await getBrands();

            if (!brands.length) {
                return bot.sendMessage(chatId, '😔 Брендів поки немає.');
            }

            const brandKeyboard = {
                reply_markup: {
                    inline_keyboard: brands.map(b => [
                        { text: b.name, callback_data: `brand_${b.id}` }
                    ])
                }
            };

            bot.sendMessage(chatId, 'Выберите бренд:', brandKeyboard);
            bot.answerCallbackQuery(query.id);
        }
    });
}

module.exports = brandsHandler;