const T = require('../locales/ru');
const db = require('../db/services');
const { checkout: t } = require('../locales/ru');
const { createOrder } = require('../woo');
const notifyNewOrder = require('./notification');

module.exports = async function finalizeOrder(bot, chatId, userId, state) {
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

            billLines.push(`• ${item.quantity} × ${item.name} = ${lineTotal.toFixed(2)} ${T.Currency}`);
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

        await db.clearCart(userId);

        const bill = [
            `${t.orderNumber}${orderResponse.id} ${t.completedSuccessfully}`,
            ``,
            `${t.yourOrder}`,
            billLines.join('\n'),
            `----------------------`,
            `${t.total} ${total.toFixed(2)} ${T.Currency}`,
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
}