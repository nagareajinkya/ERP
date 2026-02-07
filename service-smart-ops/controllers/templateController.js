const Template = require('../models/Template');

// @desc    Get all templates for business
// @route   GET /api/smart-ops/templates
// @access  Private
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find({ businessId: req.businessId }).populate('offerId');
        res.json(templates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a template
// @route   POST /api/smart-ops/templates
// @access  Private
exports.createTemplate = async (req, res) => {
    const { name, text, category, type, offerId } = req.body;

    try {
        const newTemplate = new Template({
            businessId: req.businessId,
            name,
            text,
            category,
            type,
            offerId: category === 'Offer' ? offerId : undefined
        });

        const template = await newTemplate.save();
        res.json(template);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a template
// @route   PUT /api/smart-ops/templates/:id
// @access  Private
exports.updateTemplate = async (req, res) => {
    const { name, text, category, type, offerId } = req.body;

    // Build template object
    const templateFields = {};
    if (name) templateFields.name = name;
    if (text) templateFields.text = text;
    if (category) templateFields.category = category;
    if (type) templateFields.type = type;
    if (category === 'Offer') {
        templateFields.offerId = offerId; // Update or set offerId
    } else {
        templateFields.offerId = undefined; // Clear if category changed
    }


    try {
        let template = await Template.findById(req.params.id);

        if (!template) return res.status(404).json({ msg: 'Template not found' });

        // Make sure user owns template
        if (template.businessId.toString() !== req.businessId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        template = await Template.findByIdAndUpdate(
            req.params.id,
            { $set: templateFields },
            { new: true }
        ).populate('offerId');

        res.json(template);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a template
// @route   DELETE /api/smart-ops/templates/:id
// @access  Private
exports.deleteTemplate = async (req, res) => {
    try {
        let template = await Template.findById(req.params.id);

        if (!template) return res.status(404).json({ msg: 'Template not found' });

        // Make sure user owns template
        if (template.businessId.toString() !== req.businessId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Template.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Template removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
