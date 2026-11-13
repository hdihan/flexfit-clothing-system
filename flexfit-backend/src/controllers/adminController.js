const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Return = require('../models/Return');

// ═══════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new user (admin-initiated)
// @route   POST /api/admin/users
// @access  Admin
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
        });

        res.status(201).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = req.body.name ?? user.name;
        user.email = req.body.email ?? user.email;
        user.role = req.body.role ?? user.role;
        user.isActive = req.body.isActive ?? user.isActive;

        if (req.body.password) user.password = req.body.password;

        const updated = await user.save();
        res.json({ success: true, user: updated });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a user (with protections)
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 🛡️ Protection 1: Never delete admin accounts
        if (user.role === 'admin') {
            return res.status(403).json({
                message: 'Admin accounts cannot be deleted',
            });
        }

        // 🛡️ Protection 2: Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(403).json({
                message: 'You cannot delete your own account',
            });
        }

        // Cascade delete related data
        await Promise.all([
            Vendor.deleteMany({ user: user._id }),
            Product.deleteMany({ vendor: user._id }),
            Order.deleteMany({ user: user._id }),
            Return.deleteMany({ user: user._id }),
        ]);

        await user.deleteOne();

        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Admin
exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({})
            .populate('vendor', 'storeName')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: products.length, products });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Admin
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        ['name', 'description', 'category', 'price', 'images', 'colors', 'sizes', 'isActive'].forEach((k) => {
            if (req.body[k] !== undefined) product[k] = req.body[k];
        });

        const updated = await product.save();
        res.json({ success: true, product: updated });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        next(err);
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = req.body.status || order.status;
        if (order.status === 'Delivered') order.deliveredAt = new Date();

        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete an order
// @route   DELETE /api/admin/orders/:id
// @access  Admin
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════
// RETURNS
// ═══════════════════════════════════════════════════════

// @desc    Get all returns
// @route   GET /api/admin/returns
// @access  Admin
exports.getReturns = async (req, res, next) => {
    try {
        const returns = await Return.find({})
            .populate('user', 'name email')
            .populate('order', 'orderNumber totalPrice')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: returns.length, returns });
    } catch (err) {
        next(err);
    }
};

// @desc    Update return status/refund
// @route   PUT /api/admin/returns/:id
// @access  Admin
exports.updateReturn = async (req, res, next) => {
    try {
        const ret = await Return.findById(req.params.id);
        if (!ret) return res.status(404).json({ message: 'Return not found' });

        ret.status = req.body.status ?? ret.status;
        if (req.body.refundAmount !== undefined) ret.refundAmount = req.body.refundAmount;
        if (['Refunded', 'Rejected'].includes(ret.status)) ret.resolvedAt = new Date();

        await ret.save();
        res.json({ success: true, return: ret });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a return
// @route   DELETE /api/admin/returns/:id
// @access  Admin
exports.deleteReturn = async (req, res, next) => {
    try {
        const ret = await Return.findByIdAndDelete(req.params.id);
        if (!ret) return res.status(404).json({ message: 'Return not found' });
        res.json({ success: true, message: 'Return deleted' });
    } catch (err) {
        next(err);
    }
};