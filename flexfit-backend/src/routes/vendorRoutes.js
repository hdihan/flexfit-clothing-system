const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/register', protect, authorize('vendor'), ctrl.registerVendor);
router.get('/dashboard', protect, authorize('vendor'), ctrl.getVendorDashboard);
router.get('/low-stock', protect, authorize('vendor'), ctrl.getLowStock);
router.put('/orders/:orderId/status', protect, authorize('vendor'), ctrl.updateOrderStatus);

// Returns — vendor-side (filtered to their products)
router.get('/returns', protect, authorize('vendor'), ctrl.getVendorReturns);
router.put('/returns/:id/status', protect, authorize('vendor'), ctrl.updateVendorReturnStatus);

router.post('/report/email', protect, authorize('vendor'), ctrl.sendPerformanceReport);

module.exports = router;