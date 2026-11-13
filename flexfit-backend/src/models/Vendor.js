const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        storeName: {
            type: String,
            required: [true, 'Store name is required'],
            trim: true,
            unique: true,
        },
        businessRegNo: {
            type: String,
            required: [true, 'Business registration number is required'],
            trim: true,
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        logo: {
            type: String,
            default: '',
        },
        bankDetails: {
            accountName: String,
            accountNumber: String,
            bankName: String,
            branch: String,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'suspended'],
            default: 'pending',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalSales: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for quick lookup by user
vendorSchema.index({ user: 2 });

module.exports = mongoose.model('Vendor', vendorSchema);