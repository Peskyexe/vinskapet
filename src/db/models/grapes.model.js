const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertGrapes(grapes) {
    const grapeIds = [];

    for (const grape of grapes) {
        const grapeId = await utilitiesModel.getRowIdFromKey('grapes', 'name', grape.name, 'grape_id');
        grapeIds.push(grapeId);
    }

    return grapeIds;
}

async function insertWineGrapes(wineId, grapes) {
    const grapeIds = await insertGrapes(grapes);

    const insertQuery = 'INSERT INTO wine_grapes (grape_id, wine_id, percentage) VALUES ($1, $2, $3)';

    for (const [index, grape] of grapes.entries()) {
        const insertValues = [grapeIds[index], wineId, grape.percentage];
        await db.query(insertQuery, insertValues);
    }
}

module.exports = {
    insertWineGrapes
}