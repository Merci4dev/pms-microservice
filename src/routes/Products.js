
// import express from 'express';
// import multer from 'multer';
// import { ProductController } from '../controllers/ProductController.js'; // Ajusta la ruta según sea necesario


// const router = express.Router();
// const upload = multer({ dest: 'uploads/' });

// router.post('/import', upload.single('file'), ProductController.importProducts);

// router.post('/sell', ProductController.sellProducts)

// router.get('/', ProductController.listProducts);
// router.get('/recommendations/:id', ProductController.getProductRecommendations);

// router.get('/check-availability', ProductController.checkProductAvailability);

// router.get('/frequently-bought-together', ProductController.getFrequentlyBoughtTogetherProducts);

// router.patch('/:id', ProductController.updateProduct)

// export default router;



// This script defines various API endpoints for managing products and interacts with the ProductController to handle requests.
import express from 'express';
import multer from 'multer';
import { ProductController } from '../controllers/ProductController.js'; // Adjust the path as needed

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Endpoint to import a product feed
router.post('/import', upload.single('file'), ProductController.importProducts);

// Endpoint to sell products
router.post('/sell', ProductController.sellProducts);

// Endpoint to list products
router.get('/', ProductController.listProducts);

// Endpoint to get product recommendations
router.get('/recommendations/:id', ProductController.getProductRecommendations);

// Endpoint to check product availability
router.get('/check-availability', ProductController.checkProductAvailability);

// Endpoint to get frequently bought together products
router.get('/frequently-bought-together', ProductController.getFrequentlyBoughtTogetherProducts);

// Endpoint to update a product
router.patch('/:id', ProductController.updateProduct);

export default router;


