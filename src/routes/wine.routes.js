const express = require('express');
const router = express.Router();

const wineController = require('../apis/wine.controller.js');

router.get('/getWineFull/:vmpId', wineController.getWineFull);
router.get('/getWineBasic/:vmpId', wineController.getWineBasic);
router.get('/getPageCount', wineController.getPageCount);
router.get('/getPage/:pageNumber', wineController.getPage);

module.exports = router;