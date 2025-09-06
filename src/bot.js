const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = process.env.BOT_API_KEY;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
module.exports = bot;