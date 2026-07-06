const utilitiesModel = require('./utilities.model.js');

// Not caught here: a failed insert must propagate so the enclosing transaction rolls back.
async function insertWineTastes(client, wineId, tastes) {
    await utilitiesModel.insertSimpleJunctionTable(client, 'tastes', 'name', tastes, 'taste_id', wineId, 'wine_tastes');
}

async function getWineTastes(wineId) {
    try {
        return await utilitiesModel.readSimpleJunctionTable(wineId, 'wine_tastes', 'tastes', 'taste_id', 'name');
    } catch (err) {
        console.error('Error getting wine tastes,', err.stack);
    }
}

module.exports = {
    insertWineTastes,
    getWineTastes
}