// This script defines various API endpoints for managing products and interacts with the ProductController to handle requests.
import express from 'express';
import { ProductController } from '../controllers/Products.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({dest: 'Uploads/'})

// Endpoint to list products
router.get('/', ProductController.listProducts)

// Endpoint to sell products
router.post('/sell', ProductController.sellProducts)

// Endpoint to import a product feed
router.post('/import', upload.single('file'), ProductController.importProducts);

// Endpoint to update a product
router.patch('/update/:id', ProductController.updateProduct)

// Endpoint to check product availability
router.get('/check-availability', ProductController.checkProductAvailability)

// Endpoint to get product recommendations
router.get('/recommendations/:id', ProductController.getProductRecommendations)

// Endpoint to get frequently bought together products
router.get('/frequently-bought-together', ProductController.getFrequentlyBoughtTogetherProducts)


export default router



