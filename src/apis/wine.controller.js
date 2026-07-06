const wineService = require('../services/wine.service.js');
const { request, response } = require('express');

exports.getWineFull = async (request, response) => {
    try {
        const wineFull = await wineService.getWineFull(request.params.vmpId);
        response.status(200).json({ wineFull });
    } catch (err) {
        response.status(500).json({ error: err.message});
    }
}

exports.getWineBasic = async (request, response) => {
    try {
        const wineBasic = await wineService.getWineBasic(request.params.vmpId);
        response.status(200).json({ wineBasic });
    } catch (err) {
        response.status(500).json({ error: err.message});
    }
}

exports.getPageCount = async (request, response) => {
    try {
        const pageCount = await wineService.getPageCount();
        response.status(200).json({ pageCount });
    } catch (err) {
        response.status(500).json({ error: err.message});
    }
}

exports.getPage = async (request, response) => {
    try {
        const page = await wineService.getPage(request.params.pageNumber);
        response.status(200).json({ page });
    } catch (err) {
        response.status(500).json({ error: err.message});
    }
}