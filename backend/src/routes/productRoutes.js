const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/categories', productController.getCategories);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:productId', productController.getProductDetail);
router.get('/', productController.getProducts);

module.exports = router;
