const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Generate hash before starting a payment
router.post('/hash', protect, ctrl.generateHash);

// PayHere server-to-server webhook — MUST be public
router.post('/notify', ctrl.handleNotify);

// Dev-only fallback to mark order paid (frontend callback)
router.put('/confirm/:orderId', protect, ctrl.confirmPayment);

module.exports = router;