require('dotenv').config();
const {
    cartHandler,
    checkoutHandler,
    mainMenuHandler,
    ordersHandler,
    productsHandler,
    startHandler
} = require('./src/handlers');
const bot = require('./src/bot');

startHandler(bot);
mainMenuHandler(bot);
productsHandler(bot);
cartHandler(bot);
checkoutHandler(bot);
ordersHandler(bot);

console.log('🤖 Bot has started');