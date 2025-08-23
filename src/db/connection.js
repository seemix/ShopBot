const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URL;

async function connectDB() {
    try {
        await mongoose.connect(mongoUrl);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}

module.exports = connectDB;