const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
    {
        returnNumber: { type: String, unique: true },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: String,
                quantity: Number,
            },
        ],
        reason: {
            type: String,
            required: true,
            enum: ['Sizing', 'Defect', 'Changed Mind', 'Wrong Item', 'Other'],
        },
        description: { type: String, maxlength: 500 },
        photos: [String],
        status: {
            type: String,
            enum: ['Requested', 'Approved', 'Rejected', 'In Transit', 'Received', 'Refunded'],
            default: 'Requested',
        },
        refundAmount: { type: Number, default: 0 },
        resolvedAt: Date,
    },
    { timestamps: true }
);

returnSchema.pre('save', async function () {
    if (!this.returnNumber) {
        this.returnNumber = 'RET-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
});

module.exports = mongoose.model('Return', returnSchema);