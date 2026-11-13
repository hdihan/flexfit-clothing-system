const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name: String,
    image: String,
    price: Number,
    size: String,
    color: String,
    quantity: Number,
});

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [orderItemSchema],
        shippingAddress: {
            shippingType: { type: String, enum: ['domestic', 'international'], default: 'domestic' },
            street: { type: String, required: true },
            street2: { type: String },
            city: { type: String, required: true },
            district: { type: String },
            state: { type: String },
            country: { type: String, default: 'Sri Lanka' },
            postalCode: { type: String },
            phone: { type: String },
        },
        paymentMethod: { type: String, default: 'card' },
        paymentResult: {
            id: String,
            status: String,
            updateTime: String,
            email: String,
        },
        itemsPrice: { type: Number, required: true, default: 0 },
        shippingPrice: { type: Number, required: true, default: 0 },
        taxPrice: { type: Number, required: true, default: 0 },
        discount: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true, default: 0 },
        isPaid: { type: Boolean, default: false },
        paidAt: Date,
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        deliveredAt: Date,
    },
    { timestamps: true }
);

// Auto-generate order number — Mongoose 8 async style
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        this.orderNumber = 'FF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
});

module.exports = mongoose.model('Order', orderSchema);