
import { Product, ProductPair } from '../models/Products.js';
import csvParser from 'csv-parser';
import fs from 'fs';

/**
 * A utility function for handling error responses.
 * It logs the error and sends a response to the client with the specified status code and error message.
*/
function handleErrorResponse(res, error, message = 'Se ha producido un error', statusCode = 500) {
    console.error(message, error);
    res.status(statusCode).json({ error: message });
}

/**
 * This class contains static methods for handling product-related HTTP requests.
 * Each method handles a specific product-related action such as importing products, selling products, etc.
 * The methods in this class use the 'Product' model to interact with the database and respond to client requests.
*/
export class ProductController {

    /**
     * This method imports products from a CSV file. It reads the CSV file using a stream and parses the data.
     * Products are validated, and if they meet the criteria, they are added to the 'products' array.
     * If any error occurs during processing, it sets 'errorOccurred' to true and responds with an error message.
     * If no errors occurred, it inserts the products into the database using 'Product.insertMany'.
     * If some products already exist in the database, they are not inserted to prevent duplicates.
     * After processing, it responds with a success message or an error message if any issues were encountered.
    */
    static importProducts(req, res) {

        const products = [];
        let errorOcurred = false; 
    
        const stream = fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (row) => {
                if (row.sale_price === 'null') {
                    row.sale_price = null; 
                }

                if (Object.keys(row).length > 0 && row.id) {
                    products.push(row);
                }
            })
            .on('error', (error) => {
                console.error('Error processing CSV file:', error);
                errorOcurred = true;
                res.status(500).json({ error: 'Error processing CSV file' });
            })
            .on('end', () => {
                if (!errorOcurred) {
                    Product.insertMany(products)
                        .then(() => res.status(200).send('Properly imported products.'))
                        .catch((error) => {
                            console.error('Error inserting products in the database:', error);
                            res.status(500).json({ error: 'Error inserting products in the database' });
                        });
                }
            });
    }

    /**
     * This method retrieves a list of products based on various query parameters such as title, price, stock, etc.
     * It constructs a query object based on the provided query parameters and filters the products accordingly.
     * Pagination is supported with page and limit parameters to control the number of results per page.
     * Sorting can be done based on the provided sort and order parameters.
     * The query parameters are optional, and the method returns a list of products that match the criteria.
     * If there's an error during the database query, it handles the error and responds with an error message.
    */
    static listProducts(req, res) {
        const { title, price, minPrice, maxPrice, stock, category, sort, order, sku, lastUpdated, page, limit } = req.query;

        const query = {};
      
        const pageNum = parseInt(page) || 1; 
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum; 

        if (title) query.title = { $regex: title, $options: 'i' };
        if (price) query.price = price;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (stock) query.stock = stock;
        if (category) query.category = category;

        if (sku) query.id = sku;
        if (lastUpdated) query.lastUpdated = { $gte: new Date(lastUpdated) };

        const sortOptions = {};
        if (sort) {
            const orderValue = order === 'desc' ? -1 : 1;
            sortOptions[sort] = orderValue;
        } else {
            sortOptions.title = 1;
        }

        Product.find(query)
        .sort(sortOptions)
        .skip(skip) 
        .limit(limitNum) 
        .then(products => res.status(200).json(products))
        .catch((error) => handleErrorResponse(res, error, 'Error inserting products in the database'));

    }

    /**
     * This method updates a product's information based on the provided product ID and update data.
     * It first tries to find the product by its ID, and if it exists, it updates its information.
     * If the product is not found, it responds with a 404 status and a "Product not found" message.
     * If the update is successful, it responds with a 200 status and the updated product information.
     * If there's an error during the update, it responds with a 500 Internal Server Error and includes the error message.
    */
    static async updateProduct(req, res) {
        const { id } = req.params;
        const updateData = req.body;

        try {
            const updatedProduct = await Product.findOneAndUpdate(
       
                { id: id },
                updateData,
                { new: true }
            );
            if (!updatedProduct) {
                return res.status(404).send('Product not found.');
            }
            res.status(200).json(updatedProduct);
        } catch (error) {
            console.log( {error: error.message });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * This method handles the sale of products. It takes an array of products to be sold as input.
     * For each product in the list, it checks if the product exists and has sufficient stock.
     * If any product is not found or has insufficient stock, it responds with an appropriate status and message.
     * If all products are available in sufficient quantity, it updates the product quantities and stock status,
     * and then registers the products as bought together in the database.
     * It responds with a 200 OK status if the sale is processed successfully.
     * If there's an error during the process, it responds with a 500 Internal Server Error and includes the error message.
    */
    static async sellProducts(req, res) {
        const { productsSold } = req.body; 
    
        async function registerProductsBoughtTogether(productsSold) {

            const productIds = productsSold.map(item => item.id);

            try {
               
                const existingPair = await ProductPair.findOne({ products: { $all: productIds } });


                if (existingPair) {
                    existingPair.frequency += 1;
                    await existingPair.save();
                } else {
                    const newPair = new ProductPair({ products: productIds });
                    await newPair.save();
                }
                    
            } catch (error) {
                console.error('Error when registering products purchased together:', error);
                throw new Error('Internal error when registering products purchased together');
            }
        }
    
        
        try {
            for (const item of productsSold) {
                const product = await Product.findOne({ id: item.id });
                if (!product) {
                    return res.status(404).json({ message: `Product with id ${item.id} not found` });
                }
    
                if (product.quantity < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for the product with id ${item.id}` });
                }
    
                product.quantity -= item.quantity;
                if (product.quantity === 0) {
                    product.stock = 'Out of Stock';
                }
    
                await product.save();
            }
    
            await registerProductsBoughtTogether(productsSold);
            
            res.status(200).json({ message: 'Sale processed correctly' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    /**
     * This method retrieves product recommendations based on the ID of a given product.
     * It searches for product pairs in the database where the specified product is involved.
     * The pairs are sorted by frequency in descending order, and the top 5 recommendations are retrieved.
     * It then queries the database to fetch details of the recommended products by their IDs.
     * The recommendations are returned as a JSON response with a 200 OK status.
     * If there's an error during the process, it responds with a 500 Internal Server Error and includes the error message.
    */
    static async getProductRecommendations(req, res) {
     
        const id = parseInt(req.params.id);

        try {
            const pairs = await ProductPair.find({ products: id }).sort({ frequency: -1 }).limit(5);
            const recommendedProductIds = pairs.map(pair => pair.products.find(pId => pId !== id));
            const recommendedProducts = await Product.find({ id: { $in: recommendedProductIds } });

            res.status(200).json(recommendedProducts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * This method checks the availability of a product by either its ID or title.
     * It queries the database and responds with a JSON message indicating whether the product is available or not.
     * If the product is not found, it responds with a 404 Not Found status and an appropriate message.
     * If there's an error during the process, it responds with a 500 Internal Server Error and includes the error message.
    */
    static async checkProductAvailability(req, res) {
        const { id, title } = req.query;

        try {
            let query = {};
            if (id) query.id = id;
            if (title) query.title = title;

            const product = await Product.findOne(query);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.quantity === 0) {
                return res.status(200).json({ message: 'Product not available' });
            }

            res.status(200).json({ message: 'Product available', product: product });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
 
    /**
     * This method retrieves frequently bought together product pairs from the database and returns them as JSON.
     * If there's an error during the process, it logs the error and responds with a 500 Internal Server Error.
    */
    static async getFrequentlyBoughtTogetherProducts(req, res) {
        try {
          const pairs = await ProductPair.find().sort({ frequency: -1 }).limit(10);
          res.status(200).json({ pairs });
       
        } catch (error) {
          console.error('Error when obtaining product pairs:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
    }
    
}



