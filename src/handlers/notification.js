const CHANNEL_ID = process.env.CHANNEL_ID;
const t = require('../locales/ru').notification;

module.exports = async function notifyNewOrder(bot, order) {
    const itemsList = order.line_items
        .map(item => `- ${item.name} × ${item.quantity}шт.`)
        .join('\n');

    const message = `\n📦 *${t.newOrder} #${order.id}*\n
    ${t.customer} ${order.billing.first_name} ${order.billing.last_name}
    ${t.phone} ${order.billing.phone}
    ${t.date} ${new Date(order.date_created).toLocaleString('uk-UA')}
    ${t.sum} ${order.total} MDL

    ${t.goods}
    ${itemsList}`;

    await bot.sendMessage(CHANNEL_ID, message, { parse_mode: 'Markdown' });
}