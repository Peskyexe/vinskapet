const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertWineFoodtypes(wineId, foodtypes) {
    await utilitiesModel.insertSimpleJunctionTable('foodtypes', 'foodtype', foodtypes, 'foodtype_id', wineId, 'wine_foodtypes');
}

module.exports = {
    insertWineFoodtypes
}