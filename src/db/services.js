const { Cart, User } = require('./models');
const connectDB = require('./connection');

connectDB().then();

async function saveUser(telegramId, phone) {
    await User.findOneAndUpdate(
        { telegram_id: telegramId },
        { phone },
        { upsert: true, new: true }
    );
}

async function getUser(telegramId) {
    return User.findOne({ telegram_id: telegramId }).lean();
}

async function updateUserData(telegramId, field, value) {
    const update = {};
    update[field] = value;
    await User.updateOne({ telegram_id: telegramId }, update);
}

// --- CART ---
async function addToCart(telegramId, productId, quantity = 1, name = null, price = null) {
    const existing = await Cart.findOne({ telegram_id: telegramId, product_id: productId });

    if (existing) {
        existing.quantity += quantity;
        await existing.save();
    } else {
        await Cart.create({
            telegram_id: telegramId,
            product_id: productId,
            quantity,
            name,
            price,
        });
    }
}

async function getCart(telegramId) {
    return Cart.find({ telegram_id: telegramId }).lean();
}

async function updateCartQuantity(quantity, telegramId, productId) {
    await Cart.updateOne(
        { telegram_id: telegramId, product_id: productId },
        { $inc: { quantity: quantity } }
    );
}

async function removeItem(telegramId, productId) {
    await Cart.deleteOne({ telegram_id: telegramId, product_id: productId });
}

async function clearCart(telegramId) {
    await Cart.deleteMany({ telegram_id: telegramId });
}

module.exports = {
    saveUser,
    getUser,
    updateUserData,
    addToCart,
    getCart,
    updateCartQuantity,
    removeItem,
    clearCart
};