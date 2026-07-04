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


async function checkIfWineInDB(vmpId) {
    try {
        const checkQuery = `
            SELECT w.vmp_id
            FROM wines AS w
            WHERE vmp_id = $1
            LIMIT 1
        `;
        const checkRes = await db.query(checkQuery, wineData.vmp_id);
        if (checkRes.rows.length > 0) return true;
        else return false;        
    } catch (err) {
        console.error('Error checking if wine is in DB,', err.stack);
    }
}

async function addWineToDB(wineData) {
    try {
        if (await checkIfWineInDB(wineData.vmp_id)) return;

        // General data tables
        const [wineTypeId, producerId, regionId, colorId, purchaseCategoryId] = await Promise.all([
            utilitiesModel.getRowIdFromKey('wine_types', 'name', wineData.wine_type, 'wine_type_id'),
            utilitiesModel.getRowIdFromKey('producers', 'name', wineData.producer_name, 'producer_id'),
            regionsModel.insertRegionArray(wineData.region_array),
            utilitiesModel.getRowIdFromKey('colors', 'name', wineData.color_name, 'color_id'),
            utilitiesModel.getRowIdFromKey('purchase_categories', 'name', wineData.purchase_category_name, 'purchase_category_id'),
        ]);

        const insertQuery = `
            INSERT INTO wines(vmp_id, name, vintage_year, wine_type_id, producer_id, region_id, color_id, volume_cl, price_kr, purchase_category_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING wine_id
        `;
        const insertRes = await db.query(insertQuery, [
            wineData.vmp_id,
            wineData.name,
            wineData.vintage_year,
            wineTypeId,
            producerId,
            regionId,
            colorId,
            wineData.volume_cl,
            wineData.price_kr,
            purchaseCategoryId
        ]);

        const wineId = insertRes.rows[0].wine_id;

        // Junction tables
        await Promise.all([
            wineDescriptionsModel.insertWineDescriptions(wineId, wineData.wine_descriptions_object.aroma_text, wineData.wine_descriptions_object.taste_text),
            foodtypesModel.insertWineFoodtypes(wineId, wineData.wine_foodtypes_array),
            propertiesModel.insertWineProperties(wineId, wineData.wine_properties_array),
            grapesModel.insertWineGrapes(wineId, wineData.wine_grapes_array),
            contentsModel.insertWineContents(wineId, wineData.wine_contents_array),
            tastesModel.insertWineTastes(wineId, wineData.wine_tastes_array),
            aromasModel.insertWineAromas(wineId, wineData.wine_aromas_array)
        ]);

    } catch (err) {
        console.error('Error adding wine to DB:', err.stack)
    }
    
}

// --- WINE FULL ---
// Wine Id
// Vmp Id

// Type
// Name
// Full region
// Producer
// Price

// Contents
// Grapes
// Foodtypes

// Vintage year
// Aroma text
// Aromas
// Taste text
// Tastes
// Color
// Purchase category

// DN score
// Drinking window
// Dishes

// User amount
// User status
// User amount to-buy
// User shelf
// User note
async function getWineFull(vmpId) {
    try {
        const wineQuery = `
            SELECT w.wine_id, w.vmp_id, wt.name AS type, w.name, w.region_id, p.name AS producer, w.price_kr, w.vintage_year, c.name AS color, pc.name AS purchase_category
            FROM wines AS w
            JOIN wine_types AS wt ON w.wine_type_id = wt.wine_type_id
            JOIN producers AS p ON w.producer_id = p.producer_id
            JOIN colors AS c ON w.color_id = c.color_id
            JOIN purchase_categories AS pc ON w.purchase_category_id = pc.purchase_category_id
            WHERE w.vmp_id = $1
        `;

        const wineRes = await db.query(wineQuery, [vmpId]);
        if (wineRes.rows.length === 0) return null;
        const wine = wineRes.rows[0];

        const [fullRegion, contents, grapes, foodtypes, wineDescriptions, aromas, tastes] = await Promise.all([
            regionsModel.getFullRegionPath(wine.region_id),
            contentsModel.getWineContents(wine.wine_id),
            grapesModel.getWineGrapes(wine.wine_id),
            foodtypesModel.getWineFoodtypes(wine.wine_id),
            wineDescriptionsModel.getWineDescriptions(wine.wine_id),
            aromasModel.getWineAromas(wine.wine_id),
            tastesModel.getWineTastes(wine.wine_id)
        ]);

        return {
            wineId: wine.wine_id,
            vmpId: wine.vmp_id,
            type: wine.type,
            name: wine.name,
            fullRegion,
            producer: wine.producer,
            price: parseFloat(wine.price_kr),
            contents,
            grapes,
            foodtypes,
            vintageYear: wine.vintage_year,
            aromaText: wineDescriptions.aromaText,
            aromas,
            tasteText: wineDescriptions.tasteText,
            tastes,
            color: wine.color,
            purchaseCategory: wine.purchase_category
        }
    } catch (err) {
        console.error('Error getting full wine data:', err.stack);
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

        const fullRegion = await regionsModel.getFullRegionPath(wine.region_id);

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
        console.error('Error getting basic wine data:', err.stack);
    }
}

module.exports = {
    addWineToDB,
    getWineBasic,
    getWineFull
}