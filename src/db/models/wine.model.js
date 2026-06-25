const db = require('../db.js');
const utilitiesModel = require('./utilities.model.js');
const regionsModel = require('./regions.model.js');
const wineDescriptionsModel = require('./wine-descriptions.model.js');
const foodtypesModel = require('./foodtypes.model.js');
const propertiesModel = require('./properties.model.js');
const grapesModel = require('./grapes.model.js');
const contentsModel = require('./contents.model.js');
const tastesModel = require('./tastes.model.js');
const aromasModel = require('./aromas.model.js');

async function addWineToDB(wineData) {
    try {
        // General data tables
        const producerId = await utilitiesModel.getRowIdFromKey('producers', 'name', wineData.producer_name, 'producer_id');
        const regionId = await regionsModel.insertRegionArray(wineData.region_array);
        const colorId = await utilitiesModel.getRowIdFromKey('colors', 'name', wineData.color_name, 'color_id');
        const purchaseCategoryId = await utilitiesModel.getRowIdFromKey('purchase_categories', 'name', wineData.purchase_category_name, 'purchase_category_id');

        // Wine table
        const wineQuery = 'INSERT INTO wines(vmp_id, name, vintage_year, wine_type, producer_id, region_id, color_id, volume_cl, price_kr, purchase_category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING wine_id';
        const wineValues = [
            wineData.vmp_id,
            wineData.name,
            wineData.vintage_year,
            wineData.wine_type,
            producerId,
            regionId,
            colorId,
            wineData.volume_cl,
            wineData.price_kr,
            purchaseCategoryId
        ];

        const wineRes = await db.query(wineQuery, wineValues);
        const wineId = wineRes.rows[0].wine_id;

        // Wine foreign tables
        await wineDescriptionsModel.insertWineDescriptions(wineId, wineData.wine_descriptions_object.aroma_text, wineData.wine_descriptions_object.taste_text);
        await foodtypesModel.insertWineFoodtypes(wineId, wineData.wine_foodtypes_array);
        await propertiesModel.insertWineProperties(wineId, wineData.wine_properties_array);
        await grapesModel.insertWineGrapes(wineId, wineData.wine_grapes_array);
        await contentsModel.insertWineContents(wineId, wineData.wine_contents_array);
        await tastesModel.insertWineTastes(wineId, wineData.wine_tastes_array);
        await aromasModel.insertWineAromas(wineId, wineData.wine_aromas_array);
    } catch (err) {
        console.error('Error adding wine to DB:', err.stack)
    }
    
}

async function getWineFull(VmpId) {
    try {
        
    } catch (err) {
        console.error(err.stack);
    }
}

async function getWineBasic(vmpId) {
    try {
        const wineQuery = `
            SELECT w.wine_id, w.vmp_id, w.name, w.price_kr, w.wine_type, p.name AS producer, w.region_id
            FROM wines AS w
            JOIN producers AS p ON w.producer_id = p.producer_id
            WHERE w.vmp_id = $1
        `;

        const wineRes = await db.query(wineQuery, [vmpId]);
        if (wineRes.rows.length === 0) return null;

        const wine = wineRes.rows[0];

        const regionArray = await regionsModel.getFullRegionPath(wine.region_id);
        const fullRegion = regionArray.join(', ')

        return {
            wineId: wine.wine_id,
            vmpId: wine.vmp_id,
            name: wine.name,
            type: wine.wine_type,
            fullRegion,
            producer: wine.producer,
            price: parseFloat(wine.price_kr),
            imagePath: wine.image_path
        };
    } catch (err) {
        console.error('Error getting basic wine info:', err.stack);
    }
}

module.exports = {
    addWineToDB,
    getWineBasic,
    getWineFull
}