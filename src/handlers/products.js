const t = require('../locales/ru').products;
const T = require('../locales/ru');
const woo = require('../woo');
const db = require('../db/services');
const qtyKeyboard = require('../keyboards/quantityMenu');

module.exports = function productsHandler(bot) {
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;

        // Показ товарів за брендом або категорією
        if (query.data.startsWith('brand_') || query.data.startsWith('cat_')) {
            try {
                let products = [];
                if (query.data.startsWith('brand_')) {
                    const brandId = query.data.replace('brand_', '');
                    products = await woo.getProducts({ brand: brandId });
                } else if (query.data.startsWith('cat_')) {
                    const catId = query.data.replace('cat_', '');
                    products = await woo.getProducts({ category: catId });
                }

                if (!products.length) {
                    return bot.sendMessage(chatId, t.goodsNotFound);
                }

                for (const p of products) {
                    let caption = `*${p.name}*  💵 ${p.price} ${T.Currency}`;
                    if (p.short_description) {
                        caption += `\n\n${p.short_description.replace(/<\/?[^>]+(>|$)/g, '')}`;
                    }

                    const opts = {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: t.addToCart, callback_data: `addcart_${p.id}` }]
                            ]
                        }
                    };

                    if (p.images && p.images.length > 0) {
                        await bot.sendPhoto(chatId, p.images[0].src, { caption, ...opts });
                    } else {
                        await bot.sendMessage(chatId, caption, opts);
                    }
                }
            } catch (err) {
                console.error(T.Error, err.message);
                bot.sendMessage(chatId, t.errorLoadingInfo);
            }
        }

        // --- Додавання в кошик ---
        if (query.data.startsWith('addcart_')) {
            const productId = query.data.replace('addcart_', '');
            try {
                const product = await woo.getProductById(productId);
                if (!product) {
                    return bot.answerCallbackQuery(query.id, { text: t.goodsNotFound });
                }

                // Змінюємо inline-клавіатуру в тому самому повідомленні
                await bot.editMessageReplyMarkup(
                    {
                        inline_keyboard: qtyKeyboard(productId).inline_keyboard
                    },
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id
                    }
                );

                // (опціонально) змінити текст повідомлення, щоб показати "Оберіть кількість"
                await bot.editMessageCaption(
                    `${query.message.caption || query.message.text}\n\n${t.chooseQuantity}`,
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: qtyKeyboard(productId)
                    }
                );

                bot.answerCallbackQuery(query.id);
            } catch (err) {
                console.error(t.errorAddingToCart, err.message);
                bot.answerCallbackQuery(query.id, { text: T.Error });
            }
        }

        if (query.data.startsWith('qty_')) {
            const [, productId, qty] = query.data.split('_');
            try {
                const product = await woo.getProductById(productId);

                await db.addToCart(
                    String(query.from.id),
                    productId,
                    parseInt(qty, 10),
                    product.name,
                    product.price
                );

                await bot.answerCallbackQuery(query.id, { text: t.alreadyAdded });

                // Формуємо нову клавіатуру – кнопка вже не активна
                const updatedKeyboard = {
                    inline_keyboard: [
                        [{ text: t.alreadyAdded, callback_data: 'noop' }]
                    ]
                };

                await bot.editMessageCaption(
                    `${product.name} — ${qty} ${T.Pcs}`,
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id,
                        reply_markup: updatedKeyboard
                    }
                );

            } catch (err) {
                console.error(t.errorAddingToCart, err.message);
                bot.answerCallbackQuery(query.id, { text: T.Error });
            }
        }
    });
};
