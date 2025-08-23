const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegram_id: { type: String, unique: true, required: true },
    phone: String,
    name: String,
    address: String,
});

// Кошик
const cartSchema = new mongoose.Schema({
    telegram_id: { type: String, required: true },
    product_id: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    name: String,
    price: Number,
});

const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', cartSchema);

module.exports = { User, Cart }