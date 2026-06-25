const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertContent(content) {
    const values = [content.name, content.unit];

    const findQuery = 'SELECT content_id FROM contents WHERE name = $1 AND unit = $2 LIMIT 1';
    const findRes = await db.query(findQuery, values);

    if (findRes.rows.length > 0) {
        return findRes.rows[0].content_id;
    }

    const insertQuery = 'INSERT INTO contents (name, unit) VALUES ($1, $2) RETURNING content_id';
    const insertRes = await db.query(insertQuery, values);

    return insertRes.rows[0].content_id;
}

async function insertWineContents(wineId, contents) {
    const contentIds = [];
    for (const content of contents) {
        contentIds.push(await insertContent(content));
    }

    const insertQuery = 'INSERT INTO wine_contents (content_id, wine_id, amount, less_than) VALUES ($1, $2, $3, $4)';

    for (const [index, content] of contents.entries()) {
        const insertValues = [contentIds[index], wineId, content.amount, content.less_than];
        await db.query(insertQuery, insertValues);
    }
}

module.exports = {
    insertWineContents
}