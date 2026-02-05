const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { calculate } = require('../controllers/smartOpsController');

router.post('/calculate', auth, calculate);

module.exports = router;
