const utilitiesModel = require('./utilities.model.js');

// Not caught here: a failed insert must propagate so the enclosing transaction rolls back.
async function insertWineFoodtypes(client, wineId, foodtypes) {
    await utilitiesModel.insertSimpleJunctionTable(client, 'foodtypes', 'name', foodtypes, 'foodtype_id', wineId, 'wine_foodtypes');
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