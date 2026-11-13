const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, ctrl.getCart);
router.post('/add', protect, ctrl.addToCart);
router.put('/item/:itemId', protect, ctrl.updateCartItem);
router.delete('/item/:itemId', protect, ctrl.removeCartItem);
router.delete('/clear', protect, ctrl.clearCart);

module.exports = router;