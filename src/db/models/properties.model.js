const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');

async function insertProperties(properties) {
    const propertyIds = [];

    for (const property of properties) {
        const propertyId = await utilitiesModel.getRowIdFromKey('properties', 'name', property.name, 'property_id');
        propertyIds.push(propertyId);
    }

    return propertyIds;
}

async function insertWineProperties(wineId, properties) {
    const propertyIds = await insertProperties(properties);

    const insertQuery = 'INSERT INTO wine_properties (property_id, wine_id, value) VALUES ($1, $2, $3)';

    for (const [index, property] of properties.entries()) {
        const insertValues = [propertyIds[index], wineId, property.value];
        await db.query(insertQuery, insertValues);
    }
}

module.exports = {
    insertWineProperties
}