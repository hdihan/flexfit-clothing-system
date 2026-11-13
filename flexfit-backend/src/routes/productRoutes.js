const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validate, productRules } = require('../middlewares/validationMiddleware');

router
    .route('/')
    .get(ctrl.getProducts)
    .post(protect, authorize('vendor', 'admin'), productRules, validate, ctrl.createProduct);

router
    .route('/:id')
    .get(ctrl.getProductById)
    .put(protect, authorize('vendor', 'admin'), ctrl.updateProduct)
    .delete(protect, authorize('vendor', 'admin'), ctrl.deleteProduct);

router.patch('/:id/stock', protect, authorize('vendor', 'admin'), ctrl.updateStock);
router.post('/:id/reviews', protect, ctrl.createProductReview);

module.exports = router;