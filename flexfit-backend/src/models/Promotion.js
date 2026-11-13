const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Promotion code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: [true, 'Discount type is required'],
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value must be positive'],
        },
        validFrom: {
            type: Date,
            default: Date.now,
        },
        category: {
            type: String,
            default: 'All', // e.g. 'Tops', 'Bottoms', or 'All'
        },
        validUntil: {
            type: Date,
            required: [true, 'Valid until date is required'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageLimit: {
            type: Number, // Optional: maximum number of times this code can be used overall
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor', // Optional: if created by a vendor, applies only to their products
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Promotion', promotionSchema);
