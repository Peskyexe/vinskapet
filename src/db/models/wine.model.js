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
        const regionId = await regionsModel.addWineRegionsArrayToDB(wineData.region_array);
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


// Name
// Type
// Full Region
// Producer
// Price
async function getWineBasic(VmpId) {
    try {
        const wineBasic = {
            wineId: 0,
            vmpId: 0,
            name: '',
            region_array: [],
            producer: '',
            price: 0.0
        }

        

    } catch (err) {
        console.error(err.stack);
    }
}

module.exports = {
    addWineToDB,
    getWineBasic,
    getWineFull
}