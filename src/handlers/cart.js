const T = require('../locales/ru');
const t = require('../locales/ru').cart;
const db = require('../db/services');
const buildCartKeyboard = require('../keyboards/cartMenu');

module.exports = function cartHandler(bot) {
    // Показати кошик по звичайній кнопці
    bot.on('message', async (msg) => {
        if (msg.text !== T.Cart) return;

        const chatId = msg.chat.id;
        const userId = String(msg.from.id);

        const cart = await db.getCart(userId);
        if (!cart.length) {
            return bot.sendMessage(chatId, t.yourCartIsEmpty);
        }

        const { text, keyboard } = buildCartView(cart);
        await bot.sendMessage(chatId, text, { reply_markup: keyboard });
    });

    // Обробка інлайн-кнопок кошика
    bot.on('callback_query', async (query) => {
        const data = query.data || '';
        const chatId = query.message.chat.id;
        const userId = String(query.from.id);

        // реагуємо тільки на події кошика
        const isInc = data.startsWith('inc_');
        const isDec = data.startsWith('dec_');
        const isDel = data.startsWith('del_');
        const isClear = data === 'clear_cart';

        if (!(isInc || isDec || isDel || isClear)) {
            return; // не наш callback — ігноруємо
        }

        try {
            // миттєво відповідаємо, щоб не ловити timeout
            await bot.answerCallbackQuery(query.id);

            if (isInc) {
                const productId = data.slice(4);
                db.updateCartQuantity(1, userId, productId);
            } else if (isDec) {
                const productId = data.slice(4);
                db.updateCartQuantity(-1, userId, productId);
            } else if (isDel) {
                const productId = data.slice(4);
                db.removeItem(userId, productId);
            } else if (isClear) {
                db.clearCart(userId);
            }

            // оновлюємо саме те повідомлення, з якого натиснули кнопку
            const updatedCart = db.getCart(userId);

            if (updatedCart.length) {
                const { text, keyboard } = buildCartView(updatedCart);
                await bot.editMessageText(text, {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: keyboard
                });
            } else {
                // кошик спорожнів — замінюємо текст і прибираємо клавіатуру
                await bot.editMessageText(t.yourCartIsEmpty, {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: { inline_keyboard: [] }
                });
            }
        } catch (err) {
            console.error(T.Error, err);
            // на всяк: якщо редагування не вдалось — просто надішлемо нове повідомлення
            try {
                const updatedCart = db.getCart(userId);
                if (updatedCart.length) {
                    const { text, keyboard } = buildCartView(updatedCart);
                    await bot.sendMessage(chatId, text, { reply_markup: keyboard });
                } else {
                    await bot.sendMessage(chatId, t.yourCartIsEmpty);
                }
            } catch (_) {}
        }
    });
};

// допоміжна функція рендеру тексту і клавіатури
function buildCartView(cart) {
    let total = 0;
    let text = t.yourCart+'\n\n';
    for (const item of cart) {
        const lineTotal = Number(item.price) * Number(item.quantity);
        total += lineTotal;
        text += `${item.name}\n${t.quantity} ${item.quantity} · 💵 ${lineTotal.toFixed(2)}\n\n`;
    }
    text += `${t.totalSum} ${total.toFixed(2)} MDL`;

    return { text, keyboard: buildCartKeyboard(cart) };
}