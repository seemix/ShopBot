function qtyKeyboard(productId) {
    return {
        inline_keyboard: [
            [
                { text: '1️⃣', callback_data: `qty_${productId}_1` },
                { text: '2️⃣', callback_data: `qty_${productId}_2` },
                { text: '3️⃣', callback_data: `qty_${productId}_3` },
                { text: '4️⃣', callback_data: `qty_${productId}_4` },
                { text: '5️⃣', callback_data: `qty_${productId}_5` }
            ],
            [
                { text: '6️⃣', callback_data: `qty_${productId}_6` },
                { text: '7️⃣', callback_data: `qty_${productId}_7` },
                { text: '8️⃣', callback_data: `qty_${productId}_8` },
                { text: '9️⃣', callback_data: `qty_${productId}_9` },
                { text: '🔟', callback_data: `qty_${productId}_10` }
            ]
        ]
    };
}

module.exports = qtyKeyboard;