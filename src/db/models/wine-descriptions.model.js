const db = require('../db.js')

async function insertWineDescriptions(client, wineId, aromaText, tasteText) {
    const insertQuery = 'INSERT INTO wine_descriptions(wine_id, aroma_text, taste_text) VALUES ($1, $2, $3)';
    const insertValues = [wineId, aromaText, tasteText];

    await client.query(insertQuery, insertValues)
}

async function getWineDescriptions(wineId) {
    const selectQuery = `
        SELECT wd.aroma_text, wd.taste_text
        FROM wine_descriptions AS wd
        WHERE wine_id = $1
        LIMIT 1
    `;
    const selectRes = await db.query(selectQuery, [wineId]);
    return {
        aromaText: selectRes.rows[0].aroma_text,
        tasteText: selectRes.rows[0].taste_text       
    }
}

module.exports = {
    insertWineDescriptions,
    getWineDescriptions
}