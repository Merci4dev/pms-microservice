

import request from 'supertest';
import mongoose from 'mongoose';
import Server from "../Server.js";
import { Product, ProductPair} from '../src/models/Products.model.js'; 
import { app } from "../Index.js";
import  createMockCsvFile from '../src/persistence/TemporalCsv.js'


jest.mock('chalk', () =>({
  bold: jest.fn().mockImplementation((text) => text),
  whiteBright: jest.fn().mockImplementation((text) => text),
  bold: {
    red: jest.fn().mockImplementation((text) => text)
  }
}))


describe('Import Products', () => {

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const mockCsvFilePath = createMockCsvFile();
    await request(app)
      .post('/api/products/import')
      .attach('file', mockCsvFilePath);
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });


  it('should import products successfully with valid CSV file', async () => {
    const mockCsvFilePath = createMockCsvFile();
    const response = await request(app)
        .post('/api/products/import')
        .attach('file', mockCsvFilePath);

    if (response.status !== 200) {
        console.log(response.body); 
    }

    expect(response.status).toBe(200);
    expect(response.text).toBe('Properly imported products.');

      const productsInDb = await Product.find({});
      expect(productsInDb).toHaveLength(10 ); 

      const product1 = productsInDb.find(p => p.id === 1);
      expect(product1).toBeDefined();
      expect(product1.title).toBe("Pizza Margherita");
      expect(product1.ingredients).toBe("tomato sauce,cheese");
  });


  it('should return a list of products', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({
      });
  
    expect(response.status).toBe(200);
  });


  it('should filter products by title', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ title: 'Pizza' });
    expect(response.status).toBe(200);
  });


  it('should filter products by minimum price', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ minPrice: 10 });
    expect(response.status).toBe(200);
  });


  it('should paginate the product results', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ page: 2, limit: 5 });
    expect(response.status).toBe(200);
  });


  it('should return an empty array if no products match the query', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ title: 'NonExistingProduct' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });


  it('should return an empty array if no products match the query', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ title: 'NonExistingProduct' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]); 
  });


  afterAll(async () => {
    await Product.deleteMany({});
    await mongoose.connection.close();
  });
  
})


describe('Get Product Recommendations', () => {

  let server;

  beforeAll(async () => {
    server = new Server(3000, '127.0.0.1', [], []);
    await mongoose.connect(process.env.MONGO_URI);
  });

  beforeEach(async () => {
    const productPairs = [
      { products: [1, 2], frequency: 5 },
      { products: [10, 3], frequency: 3 },
    ];

    const products = [
      { id: 10, title: 'Producto 10', price: 100 },
      { id: 2, title: 'Producto 2', price: 50 },
    ];
    await Product.deleteMany({});
    await ProductPair.deleteMany({});

    await Product.insertMany(products);
    await ProductPair.insertMany(productPairs);
  });
  

  it('should return product recommendations for a valid product ID', async () => {
    const validProductId = 1;
    const response = await request(app)
      .get(`/api/products/recommendations/${validProductId}`);
  
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); 
  });


  it('should return 404 for a valid product ID with no recommendations', async () => {
    const validProductIdNoRecommendations = 999; 
    const response = await request(app)
      .get(`/api/products/recommendations/${validProductIdNoRecommendations}`);
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'No recommendations found for this product');
  });


  it('should return 404 for a non-existent endpoint', async () => {
    const response = await request(app).get('/api/products/this-does-not-exist');
    
    expect(response.status).toBe(404);
  });

  
  it('should return 404 when no recommendations are found for a valid product ID', async () => {
    const productIdWithoutRecommendations = 123; 
    const response = await request(app)
      .get(`/api/products/recommendations/${productIdWithoutRecommendations}`);
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'No recommendations found for this product');
  });
  
  
  it('should return an error for an invalid product ID', async () => {
    const invalidProductId = 'invalid';
    const response = await request(app)
      .get(`/api/products/recommendations/${invalidProductId}`);
  
    expect(response.status).toBe(400);
  });


  it('should handle database errors gracefully', async () => {
    const validProductId = 2
    jest.spyOn(ProductPair, 'find').mockImplementationOnce(() => {
      throw new Error('Simulated database error');
    });

    const response = await request(app)
      .get(`/api/products/recommendations/${validProductId}`);
    
    expect(response.status).toBe(500); 
    expect(response.body).toHaveProperty('error', 'Internal server error');

    ProductPair.find.mockRestore();
  });


  afterEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });
  
});


describe('Update Product', () => {})


describe('Check Product Availability', () => {
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  it('should return "Product not found" for non-existing product ID', async () => {
    const nonExistingProductId = 999; 

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ id: nonExistingProductId });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Product not found');
  });

  it('should return "Product no available" when product quantity is 0', async () => {
    const productWithZeroQuantity = new Product({
      id: 123,
      title: 'Product with 0 cuantity',
      quantity: 0,
    });
    await productWithZeroQuantity.save();

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ id: productWithZeroQuantity.id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Product not available');
  });



  it('should return "Producto Not Found" for non-existing product title', async () => {
    const nonExistingProductTitle = 'Producto Inexistente';

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ title: nonExistingProductTitle });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Product not found');
  });


  it('should return "Product available" when product quantity is greater than 0', async () => {
    const productWithPositiveQuantity = new Product({
      id: 456,
      title: 'Product with positive cuantiry',
      quantity: 5,
    });
    await productWithPositiveQuantity.save();

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ id: productWithPositiveQuantity.id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Product available');
  });


  it('should return frequently bought together products', async () => {
    const response = await request(app)
      .get('/api/products/frequently-bought-together');
  
    expect(response.status).toBe(200);
  
    expect(response.body).toHaveProperty('pairs');
    
    expect(Array.isArray(response.body.pairs)).toBe(true);
    
    expect(response.body.pairs.length).toBeLessThanOrEqual(10);
    
  });


  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

});



describe('Get Product Recommendations', () => {

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  beforeEach(async () => {
    const products = [
      { id: 1, title: 'Product 1' },
      { id: 2, title: 'Product 2' },
      { id: 3, title: 'Product 3' },
    ];

    const productPairs = [
      { products: [1, 2], frequency: 5 },
      { products: [1, 3], frequency: 3 },
    ];

    await Product.insertMany(products);
    await ProductPair.insertMany(productPairs);
  });

  it('should return product recommendations for a valid product ID', async () => {
    const validProductId = 1;

    const response = await request(app)
      .get(`/api/products/recommendations/${validProductId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });


  it('should return 400 for an invalid product ID', async () => {
    const invalidProductId = 'invalid';

    const response = await request(app)
      .get(`/api/products/recommendations/${invalidProductId}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid product ID');
  });

  it('should handle internal server error gracefully', async () => {
    // Simular un error en la base de datos
    jest.spyOn(ProductPair, 'find').mockImplementationOnce(() => {
      throw new Error('Simulated database error');
    });

    const validProductId = 1;

    const response = await request(app)
      .get(`/api/products/recommendations/${validProductId}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal server error');

    ProductPair.find.mockRestore();
  });


  afterEach(async () => {
    await Product.deleteMany({});
    await ProductPair.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });


})

describe('Sell Products', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
  });

  beforeEach(async () => {
    await Product.deleteMany({});

    const products = [
      new Product({ id: 1, title: 'Producto 1', quantity: 10, price: 100, stock: 'In Stock' }),
      new Product({ id: 2, title: 'Producto 2', quantity: 5, price: 150, stock: 'In Stock' }),
    ];

    for (const product of products) {
      await product.save();
    }
    
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });
  

  it('should successfully sell products and update stock', async () => {
    const productsToSell = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 }
    ];
  
    let originalQuantities = {};
    for (const item of productsToSell) {
      const product = await Product.findOne({ id: item.id });
      expect(product).toBeDefined();
      originalQuantities[item.id] = product.quantity;
    }
  
    const response = await request(app)
      .post('/api/products/sell')
      .send({ productsSold: productsToSell });
  
    expect(response.status).toBe(200);
  
    for (const item of productsToSell) {
      const product = await Product.findOne({ id: item.id });
      expect(product.quantity).toBeLessThanOrEqual(originalQuantities[item.id] - item.quantity);
    }
  

    for (const item of productsToSell) {
      const product = await Product.findOne({ id: item.id });
      if (product.quantity === 0) {
        expect(product.stock).toBe('Out of Stock');
      }
    }
  });


  afterAll(async () => {
    await Product.deleteMany({});
    await mongoose.connection.close();
    // await server.close();
  });

  
});







