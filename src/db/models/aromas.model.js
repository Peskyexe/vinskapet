const utilitiesModel = require('./utilities.model.js');

async function insertWineAromas(wineId, aromas) {
    try {
        await utilitiesModel.insertSimpleJunctionTable('aromas', 'name', aromas, 'aroma_id', wineId, 'wine_aromas');
    } catch (err) {
        console.error('Error inserting wine aromas,', err.stack);
    }
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