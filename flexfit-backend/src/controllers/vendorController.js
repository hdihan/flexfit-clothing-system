const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Return = require('../models/Return');
const sendEmail = require('../utils/sendEmail');
const { getLowStockVariants } = require('../utils/lowStockNotifier');

// @desc    Register a vendor profile for the logged-in user
// @route   POST /api/vendors/register
// @access  Private (vendor)
exports.registerVendor = async (req, res, next) => {
    try {
        const exists = await Vendor.findOne({ user: req.user._id });
        if (exists) return res.status(400).json({ message: 'Vendor profile already exists' });

        const vendor = await Vendor.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, vendor });
    } catch (err) {
        next(err);
    }
};

// @desc    Vendor dashboard — stats + recent orders
// @route   GET /api/vendors/dashboard
// @access  Private (vendor)
exports.getVendorDashboard = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const orders = await Order.find({ 'items.vendor': vendor._id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((s, o) => s + o.totalPrice, 0),
            pending: orders.filter((o) => o.status === 'Pending').length,
            delivered: orders.filter((o) => o.status === 'Delivered').length,
        };

        res.json({ success: true, vendor, stats, orders });
    } catch (err) {
        next(err);
    }
};

// @desc    Get every low-stock / out-of-stock variant for this vendor
// @route   GET /api/vendors/low-stock
// @access  Private (vendor)
exports.getLowStock = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const alerts = await getLowStockVariants(vendor._id);

        res.json({
            success: true,
            count: alerts.length,
            outOfStock: alerts.filter((a) => a.severity === 'out').length,
            lowStock: alerts.filter((a) => a.severity === 'low').length,
            alerts,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update an order's status (vendor-side)
// @route   PUT /api/vendors/orders/:orderId/status
// @access  Private (vendor)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'Delivered') order.deliveredAt = new Date();
        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════════
// RETURNS — vendors see only returns that include their products
// ═══════════════════════════════════════════════════════════════

// @desc    Get returns relevant to this vendor (only their items shown)
// @route   GET /api/vendors/returns
// @access  Private (vendor)
exports.getVendorReturns = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        // 1. Get all product IDs belonging to this vendor
        const vendorProducts = await Product.find({ vendor: vendor._id }).select('_id');
        const vendorProductIds = vendorProducts.map((p) => p._id);

        if (vendorProductIds.length === 0) {
            return res.json({ success: true, count: 0, returns: [] });
        }

        // 2. Find returns that contain at least one of the vendor's products
        const returns = await Return.find({
            'items.product': { $in: vendorProductIds },
        })
            .populate('user', 'name email')
            .populate('order', 'orderNumber totalPrice')
            .populate('items.product', 'name images vendor price')
            .sort({ createdAt: -1 });

        // 3. Filter each return's items so the vendor only sees THEIR products
        const filtered = returns.map((ret) => {
            const obj = ret.toObject();

            const vendorItems = obj.items.filter((item) => {
                const p = item.product;
                return (
                    p &&
                    p.vendor &&
                    p.vendor.toString() === vendor._id.toString()
                );
            });

            const vendorRefund = vendorItems.reduce(
                (sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 0)),
                0
            );

            return {
                ...obj,
                items: vendorItems,               // only this vendor's items
                vendorItemCount: vendorItems.length,
                vendorRefundEstimate: vendorRefund,
                isMixedVendor: vendorItems.length < obj.items.length,
            };
        });

        // 4. Drop returns where this vendor somehow has no items (safety)
        const relevant = filtered.filter((r) => r.items.length > 0);

        res.json({ success: true, count: relevant.length, returns: relevant });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a return's status (only if it contains the vendor's items)
// @route   PUT /api/vendors/returns/:id/status
// @access  Private (vendor)
exports.updateVendorReturnStatus = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const { status } = req.body;
        const validStatuses = [
            'Requested',
            'Approved',
            'Rejected',
            'In Transit',
            'Received',
            'Refunded',
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const ret = await Return.findById(req.params.id).populate('items.product');
        if (!ret) return res.status(404).json({ message: 'Return not found' });

        // Verify this return actually contains one of the vendor's products
        const hasVendorProduct = ret.items.some(
            (item) =>
                item.product &&
                item.product.vendor &&
                item.product.vendor.toString() === vendor._id.toString()
        );
        if (!hasVendorProduct) {
            return res
                .status(403)
                .json({ message: 'Not authorized to manage this return' });
        }

        ret.status = status;
        if (['Refunded', 'Rejected'].includes(status)) {
            ret.resolvedAt = new Date();
        }
        await ret.save();

        res.json({ success: true, return: ret });
    } catch (err) {
        next(err);
    }
};

// @desc    Email the vendor a sales performance report
// @route   POST /api/vendors/report/email
// @access  Private (vendor)
exports.sendPerformanceReport = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id }).populate(
            'user',
            'email name'
        );
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const orders = await Order.find({ 'items.vendor': vendor._id });

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
        const pending = orders.filter((o) => o.status === 'Pending').length;
        const delivered = orders.filter((o) => o.status === 'Delivered').length;

        // Include a low-stock snapshot in the report
        const lowStockAlerts = await getLowStockVariants(vendor._id);
        const lowStockBlock = lowStockAlerts.length
            ? `\n\n⚠️  LOW STOCK ALERTS (${lowStockAlerts.length})\n` +
            lowStockAlerts
                .slice(0, 10)
                .map(
                    (a) =>
                        `  • ${a.name} (${a.size}) — stock ${a.stock} / threshold ${a.threshold}`
                )
                .join('\n') +
            (lowStockAlerts.length > 10
                ? `\n  …and ${lowStockAlerts.length - 10} more.`
                : '')
            : '\n\n✅ All variants are above their low-stock threshold.';

        const message =
            `Hello ${vendor.storeName},\n\n` +
            `Here is your latest sales performance report:\n\n` +
            `- Total Orders: ${totalOrders}\n` +
            `- Total Revenue: LKR ${totalRevenue.toLocaleString()}\n` +
            `- Pending Orders: ${pending}\n` +
            `- Delivered Orders: ${delivered}` +
            lowStockBlock +
            `\n\nKeep up the good work!\n\nBest,\nFlexFit Team`;

        await sendEmail({
            email: vendor.user.email,
            subject: 'Your FlexFit Sales Performance Report',
            message,
        });

        res.json({ success: true, message: 'Report sent successfully.' });
    } catch (err) {
        next(err);
    }
};