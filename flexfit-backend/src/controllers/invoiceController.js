const Order = require('../models/Order');
const generateInvoice = require('../utils/generateInvoice');

exports.downloadInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        generateInvoice(order, res);
    } catch (err) {
        next(err);
    }
};