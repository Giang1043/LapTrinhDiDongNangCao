const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authenticate');

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Orders
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:orderId', adminController.getOrderDetail);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Users
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/deactivate', adminController.deactivateUser);

// Products
router.get('/products', adminController.getAllProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:categoryId', adminController.updateCategory);
router.delete('/categories/:categoryId', adminController.deleteCategory);

// Users - Additional
router.put('/users/:userId/reactivate', adminController.reactivateUser);

module.exports = router;
