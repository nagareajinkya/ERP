const express = require('express');
const router = express.Router();
const auth = require('../auth'); // Adjust path as needed based on folder structure
const printerController = require('../controllers/printerController');

// @route   GET /api/smart-ops/printer-settings
// @desc    Get printer settings
// @access  Private
router.get('/', auth, printerController.getSettings);

// @route   PUT /api/smart-ops/printer-settings
// @desc    Update printer settings
// @access  Private
router.put('/', auth, printerController.updateSettings);

module.exports = router;
