const T = require('../locales/ru');
const t = require('../locales/ru').notification;
const CHANNEL_ID = process.env.CHANNEL_ID;

module.exports = async function notifyNewOrder(bot, order) {
    const itemsList = order.line_items
        .map(item => `- ${item.name} × ${item.quantity}${T.Pcs}`)
        .join('\n');
    const dateObj = new Date(order.date_created);
    const date = dateObj.toLocaleDateString(T.Locale);
    const time = dateObj.toLocaleTimeString(T.Locale, { hour: '2-digit', minute: '2-digit' });
    const message = `\n📦 *${t.newOrder} #${order.id}*\n
    ${t.customer} ${order.billing.first_name}
    ${t.phone} ${order.billing.phone}
    ${t.date} ${date} ${time}\n
    ${t.sum} ${order.total} ${T.Currency}

    ${t.goods}
    ${itemsList}`;

    await bot.sendMessage(CHANNEL_ID, message, { parse_mode: 'Markdown' });
}