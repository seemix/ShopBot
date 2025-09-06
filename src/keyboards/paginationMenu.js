function paginationMenu(pages, prefix, currentPage) {
    const buttonsText = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

    const cleanPrefix = prefix.split('_page')[0]; // забираємо зайве

    let pageButtons = [];
    for (let i = 0; i < pages && i < buttonsText.length; i++) {
        if (i + 1 === currentPage) {
            // виділяємо активну сторінку і блокуємо її
            pageButtons.push({ text: `[ ${i + 1} ]`, callback_data: 'noop' });
        } else {
            pageButtons.push({ text: buttonsText[i], callback_data: `${cleanPrefix}_page_${i + 1}` });
        }
    }

    return {
        inline_keyboard: [
            pageButtons
        ].filter(row => row.length > 0) // прибираємо пусті ряди
    };
}

module.exports = paginationMenu;