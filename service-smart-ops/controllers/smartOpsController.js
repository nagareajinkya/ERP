const Offer = require('../models/Offer');
const { calculateOffers } = require('../utils/offerEngine');

// @desc    Calculate Transaction Totals & Offers
// @route   POST /api/smart-ops/calculate
// @access  Private (Business)
const calculate = async (req, res) => {
    try {
        // customerId comes from frontend (selectedCustomer.id)
        const { products, customerId, date } = req.body;
        const businessId = req.businessId;

        if (!businessId) {
            return res.status(400).json({ message: 'Business ID missing' });
        }

        // 1. Fetch Active Offers for this Business
        // Query: BusinessID + Status='active' + Date Range check
        const now = date ? new Date(date) : new Date();

        const offers = await Offer.find({
            businessId,
            status: 'active',
            startDate: { $lte: now },
            $or: [
                { endDate: { $exists: false } }, // No end date
                { endDate: null },
                { endDate: { $gt: now } }        // Not yet expired
            ]
        });

        // 2. Run Calculation Engine
        // Pass customerId for 'specific' targetType filtering and exclude manual removals
        const result = calculateOffers(products || [], offers, customerId, req.body.excludedOffers || []);

        res.json(result);

    } catch (error) {
        console.error('Calculation Error:', error);
        res.status(500).json({ message: 'Server Error during calculation' });
    }
};

module.exports = { calculate };
