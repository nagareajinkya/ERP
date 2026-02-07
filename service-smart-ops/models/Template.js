const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    businessId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Payment', 'Order', 'Marketing', 'Offer', 'Other'],
        default: 'Payment'
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    text: {
        type: String,
        required: true
    },
    type: {
        type: String, // e.g. 'whatsapp', 'sms', 'both'
        default: 'whatsapp'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for unique names within a business (optional but good practice)
TemplateSchema.index({ businessId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Template', TemplateSchema);
