const rootMenu = {
    keyboard: [
        [
            { text: '🧾 Мои заказы', callback_data: 'my_orders' },
            { text: '🛒 Корзина', callback_data: 'show_cart' },
            { text: '📃 Меню', callback_data: 'menu' }
        ],
    ],
    resize_keyboard: true
}
module.exports = rootMenu;
