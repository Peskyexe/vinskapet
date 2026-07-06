const jsonSerivce = require('../services/json.service.js');
const wineModel = require('../db/models/wine.model.js');
const db = require('../db/db.js');
const { request, response } = require('express');

async function populateDB() {
    await db.resetDB();

    let wines = await jsonSerivce.readDataFromJSON('wines');

    for (const wine of wines) {
        await wineModel.addWineToDB(wine);
    }

    console.log('DB populated.');
}

exports.populateDB = async (request, response) => {
    try {
        await populateDB();
        response.status(200);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }    
}

exports.resetDB = async (request, response) => {
    try {
        await db.resetDB();
        response.status(200);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }    
}