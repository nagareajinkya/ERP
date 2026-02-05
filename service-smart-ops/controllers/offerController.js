const Offer = require('../models/Offer');

// Helper to calculate derived display fields
const calculateDerivedFields = (data) => {
    let description = '';
    let displayValue = '';
    let ruleName = '';
    let targetDescription = '';

    // Rule & Value
    if (data.ruleType === 'cart_value') {
        ruleName = 'Cart Discount';
        displayValue = data.discountType === 'percentage' ? `${data.discountValue}%` : `₹${data.discountValue}`;
        description = `${displayValue} Off on Bill > ₹${data.minPurchase}`;
    } else if (data.ruleType === 'product_disc') {
        ruleName = 'Product Discount';
        displayValue = data.discountType === 'percentage' ? `${data.discountValue}%` : `₹${data.discountValue}`;
        description = `${displayValue} Off on ${data.buyProductName}`;
    } else if (data.ruleType === 'bogo') {
        ruleName = 'Free Item';
        displayValue = `${data.getQty} Free`;
        description = `Buy ${data.buyQty} ${data.buyProductName}, Get ${data.getQty} ${data.getProductName} Free`;
    }

    // Target
    if (data.targetType === 'all') targetDescription = 'All Customers';
    else if (data.targetType === 'top_spenders') targetDescription = `Top ${data.topSpenderCount} Spenders`;
    else if (data.targetType === 'frequent') targetDescription = 'Frequent Visitors';
    else if (data.targetType === 'specific') targetDescription = 'Specific Customers';

    return { description, displayValue, ruleName, targetDescription };
};

// @desc    Get all offers for the business
// @route   GET /api/smart-ops/offers
// @access  Private
exports.getOffers = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { businessId: req.businessId };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const offers = await Offer.find(query).sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new offer
// @route   POST /api/smart-ops/offers
// @access  Private
exports.createOffer = async (req, res) => {
    try {
        const {
            name, ruleType,
            minPurchase, discountType, discountValue,
            buyProductName, buyProductUnit, buyQty,
            getProductName, getProductUnit, getQty,
            usageType, usageLimitCount,
            targetType, selectedCustomers,
            topSpenderCount, topSpenderDuration, topSpenderUnit,
            minVisits, frequentDuration,
            startDate, endDate,
            colorTheme
        } = req.body;

        // Basic validation
        if (!name || !ruleType || !startDate) {
            return res.status(400).json({ msg: 'Please provide required fields (name, ruleType, startDate)' });
        }

        const derived = calculateDerivedFields(req.body);

        const newOffer = new Offer({
            businessId: req.businessId,
            name, ruleType,
            minPurchase: minPurchase ? Number(minPurchase) : undefined,
            discountType,
            discountValue: discountValue ? Number(discountValue) : undefined,
            buyProductName, buyProductUnit,
            buyQty: buyQty ? Number(buyQty) : undefined,
            getProductName, getProductUnit,
            getQty: getQty ? Number(getQty) : undefined,
            usageType,
            usageLimitCount: usageLimitCount ? Number(usageLimitCount) : undefined,
            targetType, selectedCustomers,
            topSpenderCount: topSpenderCount ? Number(topSpenderCount) : undefined,
            topSpenderDuration: topSpenderDuration ? Number(topSpenderDuration) : undefined,
            topSpenderUnit,
            minVisits: minVisits ? Number(minVisits) : undefined,
            frequentDuration: frequentDuration ? Number(frequentDuration) : undefined,
            startDate, endDate,

            // Derived fields
            description: derived.description,
            displayValue: derived.displayValue,
            // We can store ruleName and targetDescription if we want, or just derive them. 
            // The Schema has description and displayValue. Let's stick to Schema for now.
            // I'll add targetDescription to Schema or just assume frontend uses targetType.
            // Actually, for "Who is this offer for (4 entries) should be same", let's save the target string 
            // to a new field 'targetDescription' in schema or recycle 'description'.
            // Schema has 'description' and 'displayValue'. 
            // Let's add 'targetDescription' and 'ruleName' to schema dynamically? No, must match schema.
            // Let's just update 'description' and 'displayValue' as per schema.

            colorTheme,
            status: 'active'
        });

        // Determine status based on dates
        const now = new Date();
        const start = new Date(startDate);
        if (start > now) {
            newOffer.status = 'scheduled';
        }

        const offer = await newOffer.save();
        res.json({ ...offer.toObject(), ...derived }); // Return derived fields even if not in schema for immediate UI use? 
        // Better to add to Schema.
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update an offer
// @route   PUT /api/smart-ops/offers/:id
// @access  Private
exports.updateOffer = async (req, res) => {
    try {
        let offer = await Offer.findOne({ _id: req.params.id, businessId: req.businessId });

        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found' });
        }

        // Calculate derived
        const derived = calculateDerivedFields({ ...offer.toObject(), ...req.body });

        // Update fields
        const fieldsToUpdate = [
            'name', 'ruleType', 'minPurchase', 'discountType', 'discountValue',
            'buyProductName', 'buyProductUnit', 'buyQty',
            'getProductName', 'getProductUnit', 'getQty',
            'usageType', 'usageLimitCount',
            'targetType', 'selectedCustomers',
            'topSpenderCount', 'topSpenderDuration', 'topSpenderUnit',
            'minVisits', 'frequentDuration',
            'startDate', 'endDate',
            'colorTheme', 'status'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                offer[field] = req.body[field];
            }
        });

        // Update derived
        offer.description = derived.description;
        offer.displayValue = derived.displayValue;

        // Auto-update status based on new dates
        const now = new Date();
        const start = new Date(offer.startDate);
        const end = offer.endDate ? new Date(offer.endDate) : null;

        // Logic:
        // 1. Future Start -> Scheduled
        // 2. Past End -> Expired
        // 3. Current Range -> Active (only if it was Scheduled or Expired. If Paused, keep Paused unless explicitly changed?)
        if (start > now) {
            offer.status = 'scheduled';
        } else if (end && end < now) {
            offer.status = 'expired';
        } else {
            // Currently valid range
            // If it was scheduled or expired, make it active
            if (offer.status === 'scheduled' || offer.status === 'expired') {
                offer.status = 'active';
            }
            // If it was 'paused', leave it 'paused' unless user manually changed status in this same request (which acts as override)

        }

        await offer.save();
        res.json(offer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an offer
// @route   DELETE /api/smart-ops/offers/:id
// @access  Private
exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });

        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found' });
        }

        res.json({ msg: 'Offer removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Toggle offer status (Active/Paused)
// @route   PATCH /api/smart-ops/offers/:id/status
// @access  Private
exports.toggleStatus = async (req, res) => {
    try {
        const { status } = req.body; // Expecting 'active' or 'paused'

        let offer = await Offer.findOne({ _id: req.params.id, businessId: req.businessId });

        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found' });
        }

        offer.status = status;

        // If stopping the offer, set endDate to now
        if (status === 'expired') {
            offer.endDate = new Date();
        }
        // If activating and expired, maybe clear endDate or check? 
        // For now, just handling the Stop case as requested.

        await offer.save();
        res.json(offer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
