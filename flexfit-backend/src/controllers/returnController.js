const Return = require('../models/Return');
const Order = require('../models/Order');

// ─────────────────────────────────────────────────────────────
// @desc    Create a new return request
// @route   POST /api/returns
// @access  Private (customer)
// ─────────────────────────────────────────────────────────────
exports.createReturn = async (req, res, next) => {
    try {
        const order = await Order.findById(req.body.order);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not your order' });
        }

        // 30-day return window check
        if (order.deliveredAt) {
            const days = (Date.now() - order.deliveredAt) / (1000 * 60 * 60 * 24);
            if (days > 30) {
                return res.status(400).json({ message: 'Return window (30 days) has passed' });
            }
        }

        const ret = await Return.create({
            ...req.body,
            user: req.user._id,
            refundAmount: order.totalPrice,
        });

        res.status(201).json({ success: true, return: ret });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get logged-in user's returns
// @route   GET /api/returns
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getMyReturns = async (req, res, next) => {
    try {
        const returns = await Return.find({ user: req.user._id })
            .populate('order', 'orderNumber totalPrice')
            .sort({ createdAt: -1 });
        res.json({ success: true, returns });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get single return
// @route   GET /api/returns/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getReturnById = async (req, res, next) => {
    try {
        const ret = await Return.findById(req.params.id).populate('order');
        if (!ret) return res.status(404).json({ message: 'Return not found' });
        res.json({ success: true, return: ret });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update return reason/description (customer's own, only if Requested)
// @route   PUT /api/returns/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.updateReturn = async (req, res, next) => {
    try {
        const ret = await Return.findById(req.params.id);
        if (!ret) return res.status(404).json({ message: 'Return not found' });

        // Only the owner can edit
        if (ret.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only editable while Requested
        if (ret.status !== 'Requested') {
            return res.status(400).json({
                message: 'Cannot edit a return that has already been processed',
            });
        }

        // Update only allowed fields
        if (req.body.reason) {
            const validReasons = ['Sizing', 'Defect', 'Changed Mind', 'Wrong Item', 'Other'];
            if (!validReasons.includes(req.body.reason)) {
                return res.status(400).json({ message: 'Invalid reason' });
            }
            ret.reason = req.body.reason;
        }

        if (req.body.description !== undefined) {
            ret.description = req.body.description;
        }

        if (req.body.photos !== undefined) {
            ret.photos = req.body.photos;
        }

        await ret.save();
        res.json({ success: true, return: ret });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete/cancel return (customer's own, only if Requested)
// @route   DELETE /api/returns/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.deleteReturn = async (req, res, next) => {
    try {
        const ret = await Return.findById(req.params.id);
        if (!ret) return res.status(404).json({ message: 'Return not found' });

        if (ret.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (ret.status !== 'Requested') {
            return res.status(400).json({ message: 'Only pending returns can be cancelled' });
        }

        await ret.deleteOne();
        res.json({ success: true, message: 'Return cancelled' });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update return status (admin/vendor only)
// @route   PUT /api/returns/:id/status
// @access  Private (admin/vendor)
// ─────────────────────────────────────────────────────────────
exports.updateReturnStatus = async (req, res, next) => {
    try {
        const ret = await Return.findById(req.params.id);
        if (!ret) return res.status(404).json({ message: 'Return not found' });

        ret.status = req.body.status;
        if (['Refunded', 'Rejected'].includes(req.body.status)) {
            ret.resolvedAt = new Date();
        }
        await ret.save();

        res.json({ success: true, return: ret });
    } catch (err) {
        next(err);
    }
};