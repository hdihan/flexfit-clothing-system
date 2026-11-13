const mongoose = require('mongoose');
const crypto = require('crypto');

const wishlistItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        note: { type: String, maxlength: 300, default: '' },
        addedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const wishlistSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: {
            type: String,
            required: [true, 'Wishlist name is required'],
            trim: true,
            maxlength: [60, 'Wishlist name cannot exceed 60 characters'],
        },
        description: { type: String, maxlength: 300, default: '' },
        items: [wishlistItemSchema],
        isPublic: { type: Boolean, default: false },
        // Sparse unique index — many docs without token, but tokens must be unique
        shareToken: { type: String, unique: true, sparse: true, index: true },
        views: { type: Number, default: 0 },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

wishlistSchema.index({ user: 1, updatedAt: -1 });

wishlistSchema.virtual('itemCount').get(function () {
    return this.items.length;
});

// Auto-generate a share token the first time a wishlist becomes public
wishlistSchema.pre('save', async function () {
    if (this.isPublic && !this.shareToken) {
        this.shareToken = crypto.randomBytes(16).toString('hex');
    }
});

module.exports = mongoose.model('Wishlist', wishlistSchema);