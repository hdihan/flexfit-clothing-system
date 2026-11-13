const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/returnController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router
    .route('/')
    .post(protect, ctrl.createReturn)
    .get(protect, ctrl.getMyReturns);

router
    .route('/:id')
    .get(protect, ctrl.getReturnById)
    .put(protect, ctrl.updateReturn)        // ← NEW — customer edits own
    .delete(protect, ctrl.deleteReturn);

// Admin/vendor status change
router.put('/:id/status', protect, authorize('admin', 'vendor'), ctrl.updateReturnStatus);

module.exports = router;