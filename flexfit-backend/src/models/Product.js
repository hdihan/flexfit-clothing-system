const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        fitFeedback: { type: String, enum: ['Runs small', 'True to size', 'Runs large'] },
        photos: [{ type: String }],
    },
    { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        category: {
            type: String,
            required: true,
            enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'],
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
        },
        images: [{ type: String }],
        colors: [{ type: String }],
        sizes: [
            {
                size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
                stock: { type: Number, default: 0, min: 0 },
            },
        ],
        totalStock: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 5 },
        isActive: { type: Boolean, default: true },
        ratings: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        reviews: [reviewSchema],
    },
    { timestamps: true }
);

// Index for search/filter
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

// Auto-compute totalStock before save — Mongoose 8 async style (no `next`)
productSchema.pre('save', async function () {
    this.totalStock = this.sizes.reduce((sum, s) => sum + s.stock, 0);
});

module.exports = mongoose.model('Product', productSchema);