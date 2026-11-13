const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const { notifyIfLowStock } = require('../utils/lowStockNotifier');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const itemsPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

        // ── Promotion / discount calculation ─────────────────────
        let discount = 0;
        if (req.body.promotionCode) {
            const Promotion = require('../models/Promotion');
            const promo = await Promotion.findOne({
                code: req.body.promotionCode.toUpperCase(),
                isActive: true,
            });
            const now = new Date();

            if (
                promo &&
                now >= new Date(promo.validFrom) &&
                now <= new Date(promo.validUntil) &&
                (!promo.usageLimit || promo.usedCount < promo.usageLimit)
            ) {
                let eligibleItems = cart.items;

                if (promo.category && promo.category !== 'All') {
                    eligibleItems = eligibleItems.filter(
                        (item) => item.product.category === promo.category
                    );
                }

                const eligibleTotal = eligibleItems.reduce(
                    (s, i) => s + i.price * i.quantity,
                    0
                );

                if (eligibleTotal > 0) {
                    if (promo.discountType === 'percentage') {
                        discount = eligibleTotal * (promo.discountValue / 100);
                    } else if (promo.discountType === 'fixed') {
                        discount =
                            promo.discountValue > eligibleTotal
                                ? eligibleTotal
                                : promo.discountValue;
                    }
                    promo.usedCount += 1;
                    await promo.save();
                }
            }
        }

        const isInternational = req.body.shippingAddress?.shippingType === 'international';
        const shippingPrice = isInternational ? 2500 : (itemsPrice > 5000 ? 0 : 350);
        const subtotalAfterDiscount = Math.max(0, itemsPrice - discount);
        const taxPrice = Number((subtotalAfterDiscount * 0.08).toFixed(2));
        const totalPrice = subtotalAfterDiscount + shippingPrice + taxPrice;

        // ── Create order document ─────────────────────────────────
        const order = await Order.create({
            user: req.user._id,
            items: cart.items.map((i) => ({
                product: i.product._id,
                vendor: i.vendor,
                name: i.name,
                image: i.image,
                price: i.price,
                size: i.size,
                color: i.color,
                quantity: i.quantity,
            })),
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod || 'card',
            itemsPrice,
            shippingPrice,
            taxPrice,
            discount: Number(discount.toFixed(2)),
            totalPrice: Number(totalPrice.toFixed(2)),
        });

        // ── Decrement stock + low-stock notifications ─────────────
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (!product) continue;

            const sizeEntry = product.sizes.find((x) => x.size === item.size);
            if (!sizeEntry) {
                await product.save();
                continue;
            }

            const oldStock = sizeEntry.stock;
            sizeEntry.stock = Math.max(0, sizeEntry.stock - item.quantity);
            const newStock = sizeEntry.stock;

            await product.save();

            // Fire-and-forget — never block the order response on an email
            notifyIfLowStock(product, sizeEntry.size, oldStock, newStock).catch(
                (err) => console.error('[low-stock] async error:', err.message)
            );
        }

        // ── Empty the cart ────────────────────────────────────────
        cart.items = [];
        await cart.save();

        res.status(201).json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        next(err);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark an order as paid (manual / webhook fallback)
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.markAsPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = req.body.paymentResult;
        order.status = 'Processing';
        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel an unpaid pending order and restore stock + cart
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.isPaid || order.status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot cancel this order' });
        }

        // Restore stock (no low-stock alert here — stock is going UP)
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                const sizeEntry = product.sizes.find((x) => x.size === item.size);
                if (sizeEntry) sizeEntry.stock += item.quantity;
                await product.save();
            }
        }

        // Restore cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        for (const item of order.items) {
            const existing = cart.items.find(
                (i) =>
                    i.product.toString() === item.product.toString() &&
                    i.size === item.size
            );
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                cart.items.push({
                    product: item.product,
                    vendor: item.vendor,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                });
            }
        }
        await cart.save();

        await Order.findByIdAndDelete(order._id);
        res.json({ success: true, message: 'Order cancelled and cart restored' });
    } catch (err) {
        next(err);
    }
};