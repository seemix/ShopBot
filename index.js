require('dotenv').config();

const startHandler = require('./src/handlers/start');
const mainMenuHandler = require('./src/handlers/mainMenu');
const productsHandler = require('./src/handlers/products');
const cartHandler = require('./src/handlers/cart');
const checkoutHandler = require('./src/handlers/checkout');
const ordersHandler = require('./src/handlers/orders');
const bot = require('./src/bot');

startHandler(bot);
mainMenuHandler(bot);
productsHandler(bot);
cartHandler(bot);
checkoutHandler(bot);
ordersHandler(bot);

console.log('🤖 Bot has started');