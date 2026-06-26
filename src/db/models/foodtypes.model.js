const utilitiesModel = require('./utilities.model.js');

async function insertWineFoodtypes(wineId, foodtypes) {
    try {
        await utilitiesModel.insertSimpleJunctionTable('foodtypes', 'name', foodtypes, 'foodtype_id', wineId, 'wine_foodtypes');
    } catch (err) {
        console.error('Error inserting wine foodtypes,', err.stack);
    }
}

async function getWineFoodtypes(wineId) {
    try {
        return await utilitiesModel.readSimpleJunctionTable(wineId, 'wine_foodtypes', 'foodtypes', 'foodtype_id', 'name');
    } catch (err) {
        console.error('Error getting wine foodtypes,', err.stack);
    }
}

module.exports = {
    insertWineFoodtypes,
    getWineFoodtypes
}