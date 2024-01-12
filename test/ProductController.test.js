import request from 'supertest';
import { app } from '../index.js';
import  createMockCsvFile from '../persistence/TemporalCSV.js'
import { Product } from '../src/models/Products.js'; 
import mongoose from 'mongoose';

describe('Import Products', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  beforeAll(async () => {
    const mockCsvFilePath = createMockCsvFile();
    await request(app)
      .post('/api/products/import')
      .attach('file', mockCsvFilePath);
  });
  

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  it('should import products successfully with valid CSV file', async () => {
    const mockCsvFilePath = createMockCsvFile();
    const response = await request(app)
        .post('/api/products/import')
        .attach('file', mockCsvFilePath);

    if (response.status !== 200) {
        console.log(response.body); // Esto te dará detalles si hay un error
    }

    expect(response.status).toBe(200);
    expect(response.text).toBe('Properly imported products.');

      const productsInDb = await Product.find({});
      expect(productsInDb).toHaveLength(2); // Asegúrate de que se importen 2 productos

      const product1 = productsInDb.find(p => p.id === 1);
      expect(product1).toBeDefined();
      expect(product1.title).toBe("Pizza Margherita");
      expect(product1.ingredients).toBe("tomato sauce,cheese");
  });

  it('should return a list of products', async () => {
    const response = await request(app)
      .get('/api/products') // Asegúrate de que esta es la ruta correcta
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

});


describe('Update Product', () => {

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const mockCsvFilePath = createMockCsvFile();
    await request(app)
      .post('/api/products/import')
      .attach('file', mockCsvFilePath);
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  it('should update a product successfully', async () => {
  //   const updateData = { title: 'Nuevo Título Actualizado' };

  //   const existingProduct = await Product.findOne({ id: productIdToUpdate });
  //   expect(existingProduct).toBeDefined();
  
  //   const response = await request(app)
  //     .patch(`/api/products/${productIdToUpdate}`)
  //     .send(updateData);
    
  //   expect(response.status).toBe(200);
  //   const updatedProduct = await Product.findOne({ id: productIdToUpdate });
  //   expect(updatedProduct).toBeDefined();
  //   expect(updatedProduct.title).toBe('Nuevo Título Actualizado');
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
  
});


describe('Get Product Recommendations', () => {

  it('should return product recommendations for a valid product ID', async () => {
    const validProductId = 1;
    const response = await request(app)
      .get(`/api/products/recommendations/${validProductId}`);
  
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
});


describe('Check Product Availability', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return "Producto no encontrado" for non-existing product ID', async () => {
    const nonExistingProductId = 999; 

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ id: nonExistingProductId });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Product not found');
  });

  it('should return "Producto no disponible" when product quantity is 0', async () => {
    const productWithZeroQuantity = new Product({
      id: 123,
      title: 'Producto con Cantidad Cero',
      quantity: 0,
    });
    await productWithZeroQuantity.save();

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ id: productWithZeroQuantity.id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Product not available');
  });


  it('should return "Producto disponible" when product quantity is greater than 0', async () => {
    const productWithPositiveQuantity = new Product({
      id: 456,
      title: 'Producto con Cantidad Positiva',
      quantity: 5,
    });
    await productWithPositiveQuantity.save();

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ id: productWithPositiveQuantity.id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Product available');
  });


  it('should return "Producto no encontrado" for non-existing product title', async () => {
    const nonExistingProductTitle = 'Producto Inexistente';

    const response = await request(app)
      .get(`/api/products/check-availability`)
      .query({ title: nonExistingProductTitle });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Product not found');
  });

});


describe('Check Product Availability', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return frequently bought together products', async () => {
    const response = await request(app)
      .get('/api/products/frequently-bought-together');
  
    expect(response.status).toBe(200);
  
    expect(response.body).toHaveProperty('pairs');
    
    expect(Array.isArray(response.body.pairs)).toBe(true);
    
    expect(response.body.pairs.length).toBeLessThanOrEqual(10);
    
  });
  
});




