const T = require('../locales/ru');
const t = require('../locales/ru').checkout;
const db = require('../db/services');
const { createOrder } = require('../woo');
const notifyNewOrder = require('./notification');

// Тимчасове сховище станів користувачів
const orderStates = {};

module.exports = function orderHandler(bot) {
    bot.on('callback_query', async (query) => {
        const data = query.data || '';
        const chatId = query.message.chat.id;
        const userId = String(query.from.id);

        if (data !== 'checkout') return;

        await bot.answerCallbackQuery(query.id);

        const cart = await db.getCart(userId);
        if (!cart.length) {
            return bot.sendMessage(chatId, t.emptyCartImpossibleToCheckout);
        }

        // 1. Запускаємо процес оформлення
        orderStates[userId] = { step: 'payment', cart };

        await bot.sendMessage(chatId, t.choosePaymentType, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💵  '+t.cash, callback_data: 'pay_cash' },
                        { text: '🏦  '+t.card, callback_data: 'pay_card' }
                    ]
                ]
            }
        });
    });

    bot.on('callback_query', async (query) => {
        const data = query.data || '';
        const chatId = query.message.chat.id;
        const userId = String(query.from.id);

        if (!orderStates[userId]) return;

        const state = orderStates[userId];

        // --- КРОК 1: вибір оплати ---
        if (state.step === 'payment') {
            if (data === 'pay_cash' || data === 'pay_card') {
                state.payment = data === 'pay_cash' ? t.cash : t.card;
                state.step = 'profile';

                await bot.answerCallbackQuery(query.id);

                // отримати профіль користувача
                const user = await db.getUser(userId);
                state.phone = user.phone;
                if (user?.name && user?.address) {
                    state.name = user.name;
                    state.address = user.address;

                    return bot.sendMessage(chatId,
                        `${t.yourProfile}\n\n ${t.name} ${user.name}\n${t.address} ${user.address}\n\n${t.isAllCorrect}`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: t.changeName, callback_data: 'edit_name' },{ text: t.changeAddress, callback_data: 'edit_address' }],
                                  //  [],
                                    [{ text: t.confirmAndCompleteOrder, callback_data: 'confirm_profile' }]
                                ]
                            }
                        });
                } else {
                    // якщо немає даних — запитуємо спочатку ім’я
                    state.step = 'name';
                    return bot.sendMessage(chatId, t.typeYourName);
                }
            }
        }

        // --- КРОК 2: підтвердження профілю ---
        if (state.step === 'profile') {
            if (data === 'confirm_profile') {
                state.step = 'done';
                return finalizeOrder(bot, chatId, userId, state);
            }
            if (data === 'edit_name') {
                state.step = 'name';
                return bot.sendMessage(chatId, t.typeNewName);
            }
            if (data === 'edit_address') {
                state.step = 'address';
                return bot.sendMessage(chatId, t.typeShipmentAddress);
            }
        }
    });

    bot.on('message', async (msg) => {
        const userId = String(msg.from.id);
        const chatId = msg.chat.id;

        if (!orderStates[userId]) return;
        const state = orderStates[userId];

        // --- ім’я ---
        if (state.step === 'name') {
            state.name = msg.text;
            db.updateUserData(userId, 'name', state.name); // зберегли в БД
            state.step = 'address';
            return bot.sendMessage(chatId, t.typeShipmentAddress);
        }

        // --- адреса ---
        if (state.step === 'address') {
            state.address = msg.text;
            db.updateUserData(userId, 'address', state.address); // зберегли в БД
            state.step = 'done';
            return finalizeOrder(bot, chatId, userId, state);
        }
    });
};

// окремий хелпер для створення замовлення
async function finalizeOrder(bot, chatId, userId, state) {
    try {
        // рахуємо суму і формуємо білл
        let total = 0;
        let items = [];
        let billLines = [];

        for (const item of state.cart) {
            const lineTotal = Number(item.price) * Number(item.quantity);
            total += lineTotal;

            items.push({
                product_id: item.product_id,
                quantity: item.quantity
            });

            billLines.push(`• ${item.quantity} × ${item.name} = ${lineTotal.toFixed(2)} MDL`);
        }

        const orderData = {
            payment_method: state.payment === t.cash ? 'cod' : 'bacs',
            payment_method_title: state.payment,
            set_paid: false,
            billing: {
                first_name: state.name,
                phone: state.phone,
                address_1: state.address
            },
            shipping: {
                first_name: state.name,
                address_1: state.address
            },
            line_items: items
        };

        const orderResponse = await createOrder(orderData);

        db.clearCart(userId);

        const bill = [
            `${t.orderNumber}${orderResponse.id} ${t.completedSuccessfully}`,
            ``,
            `${t.yourOrder}`,
            billLines.join('\n'),
            `----------------------`,
            `${t.total} ${total.toFixed(2)} MDL`,
            ``,
            `👤 ${state.name}`,
            `🏠 ${state.address}`,
            `${t.payment}${state.payment}`
        ].join('\n');

        await bot.sendMessage(chatId, bill);
        await notifyNewOrder(bot, orderResponse);

    } catch (err) {
        console.error(T.Error, err.response?.data || err.message);
        await bot.sendMessage(chatId, t.errorDuringCheckout);
    }
    delete orderStates[userId];
}