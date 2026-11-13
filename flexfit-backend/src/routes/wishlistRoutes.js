const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

// ⚠️ Public route — must be declared BEFORE the /:id group
router.get('/shared/:token', ctrl.getSharedWishlist);

// Everything below requires auth
router.use(protect);

router.route('/').post(ctrl.createWishlist).get(ctrl.getMyWishlists);

router.route('/:id')
    .get(ctrl.getWishlistById)
    .put(ctrl.updateWishlist)
    .delete(ctrl.deleteWishlist);

router.post('/:id/items', ctrl.addItemToWishlist);
router.delete('/:id/items/:productId', ctrl.removeItemFromWishlist);
router.patch('/:id/share', ctrl.toggleShare);

module.exports = router;