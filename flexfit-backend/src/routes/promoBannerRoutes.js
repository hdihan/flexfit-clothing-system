const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promoBannerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public route for customers
router.get('/', ctrl.getActiveBanners);

// Protected routes for management
router.use(protect, authorize('admin', 'vendor'));
router.get('/manage', ctrl.getAllBanners);
router.post('/', ctrl.createBanner);
router.put('/:id', ctrl.updateBanner);
router.delete('/:id', ctrl.deleteBanner);

module.exports = router;