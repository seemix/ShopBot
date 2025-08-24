const t = require('../locales/ru').checkout;
const db = require('../db/services');
const finalizeOrder = require('./finalizeOrder');

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

        orderStates[userId] = { step: 'payment', cart };
        await bot.sendMessage(chatId, t.choosePaymentType, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💵  ' + t.cash, callback_data: 'pay_cash' },
                        { text: '🏦  ' + t.card, callback_data: 'pay_card' }
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

        if (state.step === 'payment') {
            if (data === 'pay_cash' || data === 'pay_card') {
                state.payment = data === 'pay_cash' ? t.cash : t.card;
                state.step = 'profile';

                await bot.answerCallbackQuery(query.id);

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
                                    [{ text: t.changeName, callback_data: 'edit_name' }, {
                                        text: t.changeAddress,
                                        callback_data: 'edit_address'
                                    }],
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

        if (state.step === 'profile') {
            if (data === 'confirm_profile') {
                state.step = 'done';
                const res = await finalizeOrder(bot, chatId, userId, state);
                delete orderStates[userId];
                return res;
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

        if (state.step === 'name') {
            const name = (msg.text || '').trim();

            if (name.length < 2) {
                return bot.sendMessage(chatId, t.nameTooShort);
            }

            state.name = name;
            await db.updateUserData(userId, 'name', state.name);

            state.step = 'address';
            return bot.sendMessage(chatId, t.typeShipmentAddress);
        }

        if (state.step === 'address') {
            const address = (msg.text || '').trim();

            if (address.length < 5) {
                return bot.sendMessage(chatId, t.addressTooShort);
            }

            state.address = address;
            await db.updateUserData(userId, 'address', state.address);

            state.step = 'done';
            const res = await finalizeOrder(bot, chatId, userId, state);
            delete orderStates[userId];
            return res;
        }
    });
};
