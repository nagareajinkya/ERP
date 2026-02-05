const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    businessId: {
        type: String, // Or mongoose.Schema.Types.ObjectId if referencing a central Business collection, but String UUID is fine based on auth.js
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Rule Configuration
    ruleType: {
        type: String,
        enum: ['cart_value', 'product_disc', 'bogo'],
        required: true
    },
    // Specific fields for different rule types
    minPurchase: { type: Number },
    discountType: { type: String, enum: ['percentage', 'flat'] },
    discountValue: { type: Number },

    buyProductName: { type: String },
    buyProductId: { type: String }, // Robust ID for matching
    buyProductUnit: { type: String },
    buyQty: { type: Number },

    getProductName: { type: String },
    getProductId: { type: String }, // ID to return to frontend for validation
    getProductUnit: { type: String },
    getQty: { type: Number },

    // Usage Limits
    usageType: {
        type: String,
        enum: ['single', 'unlimited', 'limited'],
        default: 'unlimited'
    },
    usageLimitCount: { type: Number }, // If limited

    // Target Audience
    targetType: {
        type: String,
        enum: ['all', 'top_spenders', 'frequent', 'specific'],
        default: 'all'
    },
    selectedCustomers: [{ type: String }], // Array of Customer IDs (from Parties service)

    // Dynamic Target Config
    topSpenderCount: { type: Number },
    topSpenderDuration: { type: Number },
    topSpenderUnit: { type: String },

    minVisits: { type: Number },
    frequentDuration: { type: Number },

    // Metadata
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    colorTheme: { type: String }, // Stores tailwind classes e.g. "bg-blue-100 text-blue-600"
    status: {
        type: String,
        enum: ['active', 'paused', 'expired', 'scheduled'],
        default: 'active'
    },

    // Derived/Display fields (optional, but helpful for UI consistency)
    description: { type: String },
    displayValue: { type: String },
    colorTheme: { type: String }, // 'blue', 'purple', 'orange' etc.

    // Stats
    usageCount: { type: Number, default: 0 }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Index for efficient querying by business and status
OfferSchema.index({ businessId: 1, status: 1 });

module.exports = mongoose.model('Offer', OfferSchema);
