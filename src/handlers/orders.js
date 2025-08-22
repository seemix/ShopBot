const t = require('../locales/ru').orders;
const { getUser } = require('../db');
const { getOrdersByPhone } = require('../woo');

module.exports = function ordersHandler(bot) {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;

        if (msg.text === '🧾 Заказы') {
            const user = getUser(String(chatId));

            if (!user) {
                return bot.sendMessage(chatId, t.noOrdersYet);
            }

            const orders = await getOrdersByPhone(user.phone);

            if (!orders.length) {
                return bot.sendMessage(chatId, t.noOrdersYet);
            }

            // Формування списку замовлень
            let response = "📋 "+user.name+ " "+t.yourOrders+"\n\n";

            orders.forEach(order => {
                const dateObj = new Date(order.date_created);
                const date = dateObj.toLocaleDateString('uk-UA');
                const time = dateObj.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                const itemsList = order.line_items.map(item => `- ${item.name} x${item.quantity}`).join('\n');
                response += `🗓️ ${date} ${time}\n${itemsList}\n${t.total}${order.total} MDL\n\n`;
            });

            bot.sendMessage(chatId, response);
        }
    });
}