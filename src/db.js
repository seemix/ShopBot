const Database = require('better-sqlite3');

const db = new Database('shop.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        telegram_id
        TEXT
        UNIQUE,
        phone
        TEXT,
        name
        TEXT,
        address
        TEXT
    );

    CREATE TABLE IF NOT EXISTS cart
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        telegram_id
        TEXT,
        product_id
        TEXT,
        quantity
        INTEGER,
        name
        TEXT,
        price
        REAL,
        FOREIGN
        KEY
    (
        telegram_id
    ) REFERENCES users
    (
        telegram_id
    )
        );
`);

// --- USERS ---
function saveUser(telegramId, phone) {
    const stmt = db.prepare(`
        INSERT INTO users (telegram_id, phone)
        VALUES (?, ?) ON CONFLICT(telegram_id) DO
        UPDATE SET phone=excluded.phone
    `);
    stmt.run(telegramId, phone);
}

function getUser(telegramId) {
    const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
    return stmt.get(telegramId);
}

function updateUserData(telegramId, field, value) {
    const stmt = db.prepare(`UPDATE users
                             SET ${field} = ?
                             WHERE telegram_id = ?`);
    stmt.run(value, telegramId);
}

//CART
function addToCart(telegramId, productId, quantity = 1, name = null, price = null) {
    // Перевіряємо чи є цей товар у кошику
    const stmt = db.prepare('SELECT * FROM cart WHERE telegram_id=? AND product_id=?');
    const row = stmt.get(telegramId, productId);

    if (row) {
        // Якщо є — збільшуємо кількість
        const upd = db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?');
        upd.run(quantity, row.id);
    } else {
        // Якщо немає — додаємо новий рядок з усіма параметрами
        const ins = db.prepare(`
            INSERT INTO cart (telegram_id, product_id, name, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        `);
        ins.run(telegramId, productId, name, price, quantity);
    }
}

function getCart(telegramId) {
    const stmt = db.prepare('SELECT * FROM cart WHERE telegram_id=?');
    const rows = stmt.all(telegramId);  // це масив
    return rows || [];
}

function updateCartQuantity(quantity, telegramId, productId) {
    const stmt = db.prepare('UPDATE cart SET quantity = quantity + ? WHERE telegram_id=? AND product_id=?');
    stmt.run(quantity, telegramId, productId);
}

function removeItem(telegramId, productId) {
    const stmt = db.prepare('DELETE FROM cart WHERE telegram_id=? AND product_id=?');
    stmt.run(telegramId, productId);
}

function clearCart(telegramId) {
    const stmt = db.prepare('DELETE FROM cart WHERE telegram_id=?');
    stmt.run(telegramId);
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