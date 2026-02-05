const Offer = require('../models/Offer');
const { calculateOffers } = require('../utils/offerEngine');

// @desc    Calculate Transaction Totals & Offers
// @route   POST /api/smart-ops/calculate
// @access  Private (Business)
const calculate = async (req, res) => {
    try {
        const { products, customerId, date } = req.body;
        const businessId = req.businessId;

        if (!businessId) {
            return res.status(400).json({ message: 'Business ID missing' });
        }

        // 1. Fetch Active Offers for this Business
        const offers = await Offer.find({
            businessId,
            active: true
        });

        // 2. Run Calculation Engine
        // Note: In refined logic, we might also filter offers based on Customer Type (e.g. 'Top Spender') 
        // if 'customerId' is provided. For now, we pass all business offers.

        const result = calculateOffers(products || [], offers);

        res.json(result);

    } catch (error) {
        console.error('Calculation Error:', error);
        res.status(500).json({ message: 'Server Error during calculation' });
    }
};

// @desc    Seed Initial Offers (Helper)
// @route   POST /api/smart-ops/seed
// @access  Private
const seedOffers = async (req, res) => {
    try {
        const businessId = req.businessId;

        // Mock Data ported from frontend
        const MOCK_OFFERS = [
            { id: 'OFF-01', name: 'Summer Sale', triggerType: 'all', action: 'cart_discount', value: 5, desc: '5% Storewide Off' },
            { id: 'OFF-02', name: 'Sugar Rush', triggerType: 'product_buy', triggerProduct: 'Sugar', action: 'item_discount', value: 20, minQty: 5, desc: '₹20 Off per 5kg Sugar' },
            { id: 'OFF-03', name: 'Rice-Maggi Combo', triggerType: 'product_buy', triggerProduct: 'Basmati Rice', action: 'auto_add', rewardProduct: 'Maggi Noodles', rewardQty: 1, minQty: 1, desc: '1 Free Maggi per kg Rice' },
            { id: 'OFF-04', name: 'Top Spender Feast', triggerType: 'product_buy', triggerProduct: 'Maggi Noodles', requiredCustomer: 'Top Spender', action: 'auto_add', rewardProduct: 'Sugar', rewardQty: 2, minQty: 10, desc: 'Free 2kg Sugar on 10 Maggi' }
        ];

        await Offer.deleteMany({ businessId }); // Clear existing for this business

        const offersToCreate = MOCK_OFFERS.map(o => ({ ...o, businessId }));
        await Offer.insertMany(offersToCreate);

        res.json({ message: 'Offers seeded successfully', count: offersToCreate.length });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { calculate, seedOffers };
