const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/', authenticate, cartController.getCart);
router.post('/add', authenticate, cartController.addToCart);
router.put('/items/:productId', authenticate, cartController.updateQuantity);
router.delete('/items/:productId', authenticate, cartController.removeFromCart);
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
