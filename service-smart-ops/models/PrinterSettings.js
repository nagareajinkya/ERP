const mongoose = require('mongoose');

const PrinterSettingsSchema = new mongoose.Schema({
    businessId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    printFormat: {
        type: String,
        enum: ['thermal', 'standard'],
        default: 'thermal'
    },
    paperSize: {
        type: String,
        default: '80mm' // For thermal
    },
    standardSize: {
        type: String,
        default: 'A4' // For standard
    },
    layout: {
        invoiceTitle: { type: String, default: 'Tax Invoice' },
        showLogo: { type: Boolean, default: true },
        logoPosition: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
        showHeaderGST: { type: Boolean, default: true },
        showHeaderPhone: { type: Boolean, default: true },
        showHeaderAddress: { type: Boolean, default: true },
        showSerialNo: { type: Boolean, default: true },
        showInvoicePrefix: { type: Boolean, default: true }, // Show "INV-" prefix from profile
        showHSN: { type: Boolean, default: true },
        showDiscount: { type: Boolean, default: true },
        showUnitPrice: { type: Boolean, default: true },
        detailedGST: { type: Boolean, default: true },
        showCurrencySymbol: { type: Boolean, default: true },
        showBillDiscount: { type: Boolean, default: true },
        showSignature: { type: Boolean, default: true },
        terms: { type: String, default: 'Goods once sold will not be taken back.' },
        showWebsite: { type: Boolean, default: false },
        websiteUrl: { type: String, default: '' },
        showInstagram: { type: Boolean, default: true },
        instagramHandle: { type: String, default: '' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PrinterSettings', PrinterSettingsSchema);
