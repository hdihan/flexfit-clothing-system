const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

// Users
router.route('/users').get(ctrl.getUsers).post(ctrl.createUser);
router.route('/users/:id').put(ctrl.updateUser).delete(ctrl.deleteUser);

// Products
router.route('/products').get(ctrl.getProducts);
router.route('/products/:id').put(ctrl.updateProduct).delete(ctrl.deleteProduct);

// Orders
router.route('/orders').get(ctrl.getOrders);
router.route('/orders/:id').put(ctrl.updateOrderStatus).delete(ctrl.deleteOrder);

// Returns
router.route('/returns').get(ctrl.getReturns);
router.route('/returns/:id').put(ctrl.updateReturn).delete(ctrl.deleteReturn);

module.exports = router;