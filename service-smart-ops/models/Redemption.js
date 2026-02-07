const mongoose = require('mongoose');

const RedemptionSchema = new mongoose.Schema({
    businessId: {
        type: String,
        required: true,
        index: true
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    transactionId: {
        type: String // We might not have this initially if async, but good to store if possible
    },
    customerId: {
        type: String // Party ID or 'walk-in'
    },
    partyName: {
        type: String
    },
    discountAmount: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for analytics
RedemptionSchema.index({ businessId: 1, offerId: 1 });
RedemptionSchema.index({ businessId: 1, date: 1 });

module.exports = mongoose.model('Redemption', RedemptionSchema);
