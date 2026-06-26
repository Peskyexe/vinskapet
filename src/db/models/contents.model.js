const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertContent(content) {
    try {
        const values = [content.name, content.unit];

        const findQuery = 'SELECT content_id FROM contents WHERE name = $1 AND unit = $2 LIMIT 1';
        const findRes = await db.query(findQuery, values);

        if (findRes.rows.length > 0) {
            return findRes.rows[0].content_id;
        }

        const insertQuery = 'INSERT INTO contents (name, unit) VALUES ($1, $2) RETURNING content_id';
        const insertRes = await db.query(insertQuery, values);

        return insertRes.rows[0].content_id;
    } catch (err) {
        console.error('Error inserting content,', err.stack)
    }
}

async function insertWineContents(wineId, contents) {
    try {
        const contentIds = [];
        for (const content of contents) {
            contentIds.push(await insertContent(content));
        }

        const insertQuery = 'INSERT INTO wine_contents (content_id, wine_id, amount, less_than) VALUES ($1, $2, $3, $4)';

        for (const [index, content] of contents.entries()) {
            const insertValues = [contentIds[index], wineId, content.amount, content.less_than];
            await db.query(insertQuery, insertValues);
        }
    } catch (err) {
        console.error('Error inserting wine contents,', err.stack);
    }
}

async function getWineContents(wineId) {
    try {
        const wineQuery = `
            SELECT wc.content_id, wc.amount, wc.less_than
            FROM wine_contents AS wc
            WHERE wine_id = $1
        `;
        const wineRes = await db.query(wineQuery, [wineId]);

        const generalQuery = `
            SELECT c.name, c.unit
            FROM contents AS c
            WHERE content_id = $1
            LIMIT 1
        `;

        const contents = [];
        for (const wineContent of wineRes.rows) {
            const contentRes = await db.query(generalQuery, [wineContent.content_id]);
            const content = contentRes.rows[0];
            contents.push({
                name: content.name,
                unit: content.unit,
                amount: parseFloat(wineContent.amount),
                less_than: wineContent.less_than
            });
        }
        return contents;
    } catch (err) {
        console.error('Error getting wine contents,', err.stack);
    }
}

module.exports = {
    insertWineContents,
    getWineContents
}