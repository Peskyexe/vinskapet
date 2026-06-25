const db = require('../db.js')

async function insertWineDescriptions(wineId, aromaText, tasteText) {
    const insertQuery = 'INSERT INTO wine_descriptions(wine_id, aroma_text, taste_text) VALUES ($1, $2, $3)';
    const insertValues = [wineId, aromaText, tasteText];

    await db.query(insertQuery, insertValues)
}

module.exports = {
    insertWineDescriptions
}