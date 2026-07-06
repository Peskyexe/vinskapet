const db = require('../db/db.js');
const wineModel = require('../db/models/wine.model.js');
const vmpService = require('../services/vmp.service.js');

// Checks if a specific wine is in the database, if it isn't, scrape it from vinmonopolet.no and add it to the database.
async function addWineIfNotExist(vmpId) {
    try {
        const wineInDB = await wineModel.checkIfWineInDB(vmpId);

        if (wineInDB === false) {
            const scrapedWine = await vmpService.getWineFull(vmpId);
            await wineModel.addWineToDB(scrapedWine);
        }
    } catch (err) {
        console.error(err.stack);
    }
}

async function getWineFull(vmpId) {
    try {
        await addWineIfNotExist(vmpId)
        return await wineModel.getWineFull(vmpId);
    } catch (err) {
        console.error('Error getting wine full,', err.stack)
    }
}

async function getWineBasic(vmpId) {
    try {
        await addWineIfNotExist(vmpId)
        return await wineModel.getWineBasic(vmpId);
    } catch (err) {
        console.error('Error getting wine basic,', err.stack)
    }
}

async function getPageCount() {
    return await wineModel.getPageCount();
}

async function getPage(pageNumber) {
    return await wineModel.getPage(pageNumber);
}

module.exports = {
    getWineBasic,
    getWineFull,
    getPageCount,
    getPage
}