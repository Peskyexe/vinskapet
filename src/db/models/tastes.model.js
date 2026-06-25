const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertWineTastes(wineId, tastes) {
    await utilitiesModel.insertSimpleJunctionTable('tastes', 'name', tastes, 'taste_id', wineId, 'wine_tastes');
}

module.exports = {
    insertWineTastes
}