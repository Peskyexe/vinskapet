const utilitiesModel = require('./utilities.model.js');

async function insertWineTastes(wineId, tastes) {
    try {
        await utilitiesModel.insertSimpleJunctionTable('tastes', 'name', tastes, 'taste_id', wineId, 'wine_tastes');
    } catch (err) {
        console.error('Error inserting wine tastes,', err.stack);
    }
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