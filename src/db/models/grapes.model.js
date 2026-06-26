const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertGrapes(grapes) {
    try {
        const grapeIds = [];

        for (const grape of grapes) {
            const grapeId = await utilitiesModel.getRowIdFromKey('grapes', 'name', grape.name, 'grape_id');
            grapeIds.push(grapeId);
        }

        return grapeIds;
    } catch (err) {
        console.error('Error inserting grapes,', err.stack);
    }
}

async function insertWineGrapes(wineId, grapes) {
    try {
        const grapeIds = await insertGrapes(grapes);

        const insertQuery = 'INSERT INTO wine_grapes (grape_id, wine_id, percentage) VALUES ($1, $2, $3)';

        for (const [index, grape] of grapes.entries()) {
            const insertValues = [grapeIds[index], wineId, grape.percentage];
            await db.query(insertQuery, insertValues);
        }
    } catch (err) {
        console.error('Error inserting wine grapes,', err.stack);
    }
}

async function getWineGrapes(wineId) {
    try {
        const wineQuery = `
            SELECT wg.grape_id, wg.percentage
            FROM wine_grapes AS wg
            WHERE wine_id = $1
        `;
        const wineRes = await db.query(wineQuery, [wineId]);

        const generalQuery = `
            SELECT g.name
            FROM grapes AS g
            WHERE grape_id = $1
            LIMIT 1
        `;

        const grapes = [];
        for (const wineGrape of wineRes.rows) {
            const grapeRes = await db.query(generalQuery, [wineGrape.grape_id]);
            const grape = grapeRes.rows[0];
            grapes.push({
                name: grape.name,
                percentage: wineGrape.percentage
            });
        };
        return grapes;
    } catch (err) {
        console.error('Error getting wine grapes,', err.stack);
    }
}

module.exports = {
    insertWineGrapes,
    getWineGrapes
}