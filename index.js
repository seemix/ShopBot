require('dotenv').config();
const express = require('express');

// Підключаємо всі хендлери бота
const startHandler = require('./src/handlers/start');
const mainMenuHandler = require('./src/handlers/mainMenu');
const productsHandler = require('./src/handlers/products');
const cartHandler = require('./src/handlers/cart');
const checkoutHandler = require('./src/handlers/checkout');
const ordersHandler = require('./src/handlers/orders');
const bot = require('./src/bot');

// Ініціалізуємо обробники
startHandler(bot);
mainMenuHandler(bot);
productsHandler(bot);
cartHandler(bot);
checkoutHandler(bot);
ordersHandler(bot);

console.log('🤖 Bot has started');

// --- Додаємо простий сервер для Render ---
const app = express();

app.get('/', (req, res) => {
    res.send('🤖 Bot is running');
});

// Render потребує відкритий порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Web service running on port ${PORT}`);
});