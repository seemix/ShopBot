const t = require('../locales/ru').cart;

function buildCartKeyboard(cartItems) {
    const keyboard = [];

    cartItems.forEach(item => {
        keyboard.push([
            { text: `➖ ${item.name} (${item.quantity}) 💵 ${item.price}`, callback_data: 'noop' }
        ]);
        keyboard.push([
            { text: '➕', callback_data: `inc_${item.product_id}` },
            { text: '➖', callback_data: `dec_${item.product_id}` },
            { text: t.delete, callback_data: `del_${item.product_id}` }
        ]);
    });

    if (cartItems.length > 0) {
        keyboard.push([
            { text: t.emptyCart, callback_data: 'clear_cart' },
            { text: t.doCheckout, callback_data: 'checkout' }
        ]);
    }

    return { inline_keyboard: keyboard };
}

module.exports = buildCartKeyboard;