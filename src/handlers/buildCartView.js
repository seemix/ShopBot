const { cart: t } = require('../locales/ru');
const T = require('../locales/ru');
const buildCartKeyboard = require('../keyboards/cartMenu');

module.exports = function buildCartView(cart) {
    let total = 0;
    let text = t.yourCart + '\n\n';
    for (const item of cart) {
        const lineTotal = Number(item.price) * Number(item.quantity);
        total += lineTotal;
        text += `${item.name}\n${t.quantity} ${item.quantity} · 💵 ${lineTotal.toFixed(2)}\n\n`;
    }
    text += `${t.totalSum} ${total.toFixed(2)} ${T.Currency}`;

    return { text, keyboard: buildCartKeyboard(cart) };
}