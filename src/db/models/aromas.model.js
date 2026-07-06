const utilitiesModel = require('./utilities.model.js');

// Not caught here: a failed insert must propagate so the enclosing transaction rolls back.
async function insertWineAromas(client, wineId, aromas) {
    await utilitiesModel.insertSimpleJunctionTable(client, 'aromas', 'name', aromas, 'aroma_id', wineId, 'wine_aromas');
}

async function getWineAromas(wineId) {
    try {
        return await utilitiesModel.readSimpleJunctionTable(wineId, 'wine_aromas', 'aromas', 'aroma_id', 'name');
    } catch (err) {
        console.error('Error getting wine aromas,', err.stack);
    }
}

module.exports = {
    insertWineAromas,
    getWineAromas
}