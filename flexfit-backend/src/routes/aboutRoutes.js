const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aboutController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public read
router.get('/', ctrl.getAbout);

// Admin-only write
router.put('/', protect, authorize('admin'), ctrl.updateAbout);
router.post('/reset', protect, authorize('admin'), ctrl.resetAbout);

module.exports = router;