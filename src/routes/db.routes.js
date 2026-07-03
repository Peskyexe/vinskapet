const express = require('express');
const router = express.Router();

const dbController = require('../apis/db.controller.js');

router.post('/populate', dbController.populateDB);
router.post('/reset', dbController.resetDB);

module.exports = router;