const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, ctrl.createOrder).get(protect, ctrl.getMyOrders);
router.get('/:id', protect, ctrl.getOrderById);
router.delete('/:id', protect, ctrl.cancelOrder);
router.put('/:id/pay', protect, ctrl.markAsPaid);

module.exports = router;