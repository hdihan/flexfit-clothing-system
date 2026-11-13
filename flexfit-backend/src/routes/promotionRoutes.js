const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    createPromotion,
    getPromotions,
    updatePromotion,
    deletePromotion,
    validatePromotion
} = require('../controllers/promotionController');

const router = express.Router();

router.post('/validate', protect, validatePromotion);

router.post('/', protect, authorize('admin', 'vendor'), createPromotion);
router.get('/', protect, authorize('admin', 'vendor'), getPromotions);
router.put('/:id', protect, authorize('admin', 'vendor'), updatePromotion);
router.delete('/:id', protect, authorize('admin', 'vendor'), deletePromotion);

module.exports = router;
