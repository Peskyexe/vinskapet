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

async function getWineProperties(wineId) {
    try {
        const wineQuery = `
            SELECT wp.property_id, wp.name
            FROM wine_properties AS wp
            WHERE wine_id = $1
        `;
        const wineRes = await db.query(wineQuery, [wineId]);

        const generalQuery = `
            SELECT p.name
            FROM properties AS p
            WHERE property_id = $1
            LIMIT 1
        `;

        const properties = [];
        for (const wineProperty of wineRes.rows) {
            const propertyRes = await db.query(generalQuery, [wineProperty.property_id]);
            const property = propertyRes.rows[0];
            properties.push({
                name: property.name,
                percentage: wineProperty.percentage
            });
        };
        return properties;
    } catch (err) {
        console.error('Error getting wine properties,', err.stack);
    }
}

module.exports = {
    insertWineProperties,
    getWineProperties
}