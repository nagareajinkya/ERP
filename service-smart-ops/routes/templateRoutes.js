const express = require('express');
const router = express.Router();
const auth = require('../auth');
const templateController = require('../controllers/templateController');

// @route   GET /api/smart-ops/templates
// @desc    Get all templates
// @access  Private
router.get('/', auth, templateController.getTemplates);

// @route   POST /api/smart-ops/templates
// @desc    Create a template
// @access  Private
router.post('/', auth, templateController.createTemplate);

// @route   PUT /api/smart-ops/templates/:id
// @desc    Update a template
// @access  Private
router.put('/:id', auth, templateController.updateTemplate);

// @route   DELETE /api/smart-ops/templates/:id
// @desc    Delete a template
// @access  Private
router.delete('/:id', auth, templateController.deleteTemplate);

module.exports = router;
