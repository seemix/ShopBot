require('dotenv').config();

const startHandler = require('./handlers/start');
const mainMenuHandler = require('./handlers/mainMenu');
const productsHandler = require('./handlers/products');
const cartHandler = require('./handlers/cart');
const checkoutHandler = require('./handlers/checkout');
const ordersHandler = require('./handlers/orders');
const bot = require('./bot');

startHandler(bot);
mainMenuHandler(bot);
productsHandler(bot);
cartHandler(bot);
checkoutHandler(bot);
ordersHandler(bot);

console.log('🤖 Bot has started');