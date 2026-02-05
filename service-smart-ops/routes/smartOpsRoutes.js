const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { calculate, seedOffers } = require('../controllers/smartOpsController');

router.post('/calculate', auth, calculate);
router.post('/seed', auth, seedOffers);

module.exports = router;
