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

// @desc    Generate personalized messages for broadcasting
// @route   POST /api/smart-ops/templates/generate-messages
// @access  Private
exports.generateMessages = async (req, res) => {
    const { templateId, customerIds, parties, businessProfile } = req.body;

    try {
        // Validate inputs
        if (!templateId || !customerIds || customerIds.length === 0) {
            return res.status(400).json({ msg: 'Template ID and customer IDs are required' });
        }

        if (!parties || parties.length === 0) {
            return res.status(400).json({ msg: 'Parties data is required' });
        }

        // 1. Fetch template with populated offer data
        const template = await Template.findById(templateId).populate('offerId');
        if (!template) {
            return res.status(404).json({ msg: 'Template not found' });
        }

        // Verify ownership
        if (template.businessId.toString() !== req.businessId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Filter only selected customers
        const selectedParties = parties.filter(p => customerIds.includes(p.id || p._id));

        if (selectedParties.length === 0) {
            return res.status(404).json({ msg: 'No matching customers found' });
        }

        // 4. Generate personalized messages
        const messages = selectedParties.map(customer => {
            // Personalize message for this customer
            const personalizedText = personalizeMessage(template.text, customer, businessProfile, template);

            // Format phone number for WhatsApp
            const formattedPhone = formatPhoneNumber(customer.phoneNumber);

            // Generate WhatsApp link
            const whatsappLink = formattedPhone
                ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(personalizedText)}`
                : null;

            return {
                customerId: customer.id || customer._id,
                customerName: customer.name,
                phone: customer.phoneNumber,
                personalizedMessage: personalizedText,
                whatsappLink: whatsappLink,
                hasValidPhone: !!formattedPhone
            };
        });

        res.json({ messages });

    } catch (err) {
        console.error('Error generating messages:', err.message);
        res.status(500).send('Server Error');
    }
};

// Helper function to personalize message
function personalizeMessage(templateText, customer, businessProfile, template) {
    let text = templateText;

    // Customer variables
    text = text.replace(/{customer_name}/g, customer.name || '[Customer Name]');
    text = text.replace(/{pending_amount}/g, customer.currentBalance || '0');

    // Business variables
    if (businessProfile) {
        text = text.replace(/{business_name}/g, businessProfile.businessName || '');
        text = text.replace(/{business_address}/g,
            businessProfile.address && businessProfile.city
                ? `${businessProfile.address}, ${businessProfile.city}`
                : '');
        text = text.replace(/{business_mobile}/g, businessProfile.phone || '');
    } else {
        text = text.replace(/{business_name}/g, '');
        text = text.replace(/{business_address}/g, '');
        text = text.replace(/{business_mobile}/g, '');
    }

    // Date variables
    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    text = text.replace(/{current_date}/g, currentDate);

    // Offer variables (if applicable)
    if (template.category === 'Offer' && template.offerId) {
        const offer = template.offerId;
        text = text.replace(/{offer_name}/g, offer.name || '[Offer Name]');
        text = text.replace(/{offer_discount}/g, offer.description || offer.ruleType || '[Offer Details]');

        if (offer.startDate) {
            const startDate = new Date(offer.startDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
            });
            text = text.replace(/{offer_start_date}/g, startDate);
        } else {
            text = text.replace(/{offer_start_date}/g, '[Start Date]');
        }

        if (offer.endDate) {
            const endDate = new Date(offer.endDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
            });
            text = text.replace(/{offer_end_date}/g, endDate);
        } else {
            text = text.replace(/{offer_end_date}/g, 'Ongoing');
        }
    }

    return text;
}

// Helper function to format phone number for WhatsApp
function formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters
    let cleaned = phone.toString().replace(/\D/g, '');

    // If number starts with 0, remove it (Indian numbers)
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }

    // If doesn't start with country code, add 91 (India)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    // Validate length (should be 12 digits for Indian numbers: 91 + 10 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
        return null;
    }

    return cleaned;
}
