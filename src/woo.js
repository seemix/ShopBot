require('dotenv').config();
const axios = require('axios');
const https = require('https');

const WC_API = axios.create({
    baseURL: process.env.API_URL + '/wp-json/wc/v3',
    auth: {
        username: process.env.WC_CUSTOMER_KEY,
        password: process.env.WC_SECRET_KEY,
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false, // ❌ for test only
    }),
});

async function getProducts(params = {}) {
    const res = await WC_API.get('/products', { params });
    return res.data;
}

async function getProductById(id) {
    const res = await WC_API.get('/products/' + id);
    return res.data;
}

async function getCategories() {
    const res = await WC_API.get('/products/categories');
    return res.data;
}

async function getBrands() {
    const res = await WC_API.get('/products/brands');
    return res.data;
}

async function createOrder(order) {
    const res = await WC_API.post('/orders', order);
    return res.data;
}

async function getOrdersByPhone(phone) {
    const res = await WC_API.get('/orders', { params: { search: phone } });
    return res.data;
}

module.exports = {
    getProducts,
    getProductById,
    getCategories,
    getBrands,
    createOrder,
    getOrdersByPhone
};