const md5 = require('md5');
const Order = require('../models/Order');

// ─────────────────────────────────────────────────────────────
// @desc    Generate PayHere hash for starting a payment
// @route   POST /api/payments/hash
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.generateHash = async (req, res, next) => {
    try {
        const { orderId, amount, currency = 'LKR' } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'orderId and amount are required' });
        }

        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantId || !merchantSecret) {
            return res.status(500).json({ message: 'PayHere credentials not configured' });
        }

        // PayHere requires amount formatted to 2 decimals
        const amountFormatted = parseFloat(amount).toFixed(2);

        // Hash formula (from PayHere docs):
        // MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
        const hashedSecret = md5(merchantSecret).toUpperCase();
        const hash = md5(
            merchantId + orderId + amountFormatted + currency + hashedSecret
        ).toUpperCase();

        res.json({
            success: true,
            merchantId,
            hash,
            amount: amountFormatted,
            currency,
            sandbox: process.env.PAYHERE_MODE !== 'live', // true for sandbox
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Handle PayHere server-to-server notification (webhook)
// @route   POST /api/payments/notify
// @access  Public (called by PayHere servers)
// ─────────────────────────────────────────────────────────────
exports.handleNotify = async (req, res, next) => {
    try {
        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
        } = req.body;

        console.log('📩 PayHere notification:', { order_id, status_code, payment_id });

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        // Rebuild local signature to verify authenticity
        const localSig = md5(
            merchant_id +
            order_id +
            payhere_amount +
            payhere_currency +
            status_code +
            md5(merchantSecret).toUpperCase()
        ).toUpperCase();

        if (localSig !== md5sig) {
            console.warn('❌ Invalid PayHere signature — possible tampering');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // status_code: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargedback
        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (status_code === '2') {
            order.isPaid = true;
            order.paidAt = new Date();
            order.status = 'Processing';
            order.paymentResult = {
                id: payment_id,
                status: 'succeeded',
                updateTime: new Date().toISOString(),
                email: req.body.email || '',
                method: 'PayHere',
            };
            await order.save();
            console.log('✅ Order marked as paid:', order_id);
        } else if (status_code === '-1' || status_code === '-2') {
            if (order.status !== 'Cancelled') {
                order.paymentResult = {
                    id: payment_id,
                    status: status_code === '-1' ? 'canceled' : 'failed',
                    updateTime: new Date().toISOString(),
                };
                order.status = 'Cancelled';
                await order.save();

                // Restore stock
                const Product = require('../models/Product');
                for (const item of order.items) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        const s = product.sizes.find(x => x.size === item.size);
                        if (s) {
                            s.stock += item.quantity;
                        }
                        await product.save();
                    }
                }
                console.log('❌ Payment failed/canceled and stock restored:', order_id);
            }
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('PayHere notify error:', err.message);
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Mark order as paid (frontend fallback when notify_url
//          can't reach localhost during development)
// @route   PUT /api/payments/confirm/:orderId
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.confirmPayment = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'Processing';
        order.paymentResult = {
            id: req.body.paymentId || 'PAYHERE-' + Date.now(),
            status: 'succeeded',
            updateTime: new Date().toISOString(),
            email: req.user.email,
            method: 'PayHere',
        };
        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};