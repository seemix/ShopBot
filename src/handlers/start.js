const T = require('../locales/ru');
const t = require('../locales/ru').start;
const mainMenu = require('../keyboards/mainMenu.js');
const rootMenu = require('../keyboards/rootMenu.js');
const { saveUser, getUser } = require('../db/services');

module.exports = function startHandler(bot) {

    const sendMainMenu = async (chatId, userName) => {
        await bot.sendMessage(chatId, userName+t.welcome, { reply_markup: rootMenu });
        await bot.sendMessage(chatId, '👇', { reply_markup: mainMenu });
    };

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const user = await getUser(String(msg.from.id));

        if (!user) {
            // Запит телефону
            bot.sendMessage(chatId, t.sharePhoneToStart, {
                reply_markup: {
                    keyboard: [
                        [{ text: t.sharePhone, request_contact: true }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            sendMainMenu(chatId,user.name+'! ');
        }
    });

    // Обробник отриманого контакту
    bot.on('contact', (msg) => {
        const chatId = msg.chat.id;

        if (!msg.contact || msg.contact.user_id !== chatId) {
            return bot.sendMessage(chatId, T.Error);
        }

        const phone = msg.contact.phone_number;
        saveUser(String(chatId), phone);
        sendMainMenu(chatId,'');
    });

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;

        if (msg.text === t.goodsMenu) {
            bot.sendMessage(chatId, '👇', { reply_markup: mainMenu });
        }
    });
};