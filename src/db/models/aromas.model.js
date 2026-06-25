const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertWineAromas(wineId, aromas) {
    await utilitiesModel.insertSimpleJunctionTable('aromas', 'name', aromas, 'aroma_id', wineId, 'wine_aromas');
}

module.exports = {
    insertWineAromas
}