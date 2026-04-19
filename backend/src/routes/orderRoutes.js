const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', authenticate, orderController.getUserOrders);
router.get('/:orderId', authenticate, orderController.getOrderDetail);
router.post('/', authenticate, orderController.createOrder);
router.post('/:orderId/cancel', authenticate, orderController.cancelOrder);

module.exports = router;
