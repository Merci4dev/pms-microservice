
import Server from "../Server";
import mongoose from 'mongoose';
import request from 'supertest';
import {server, connectToDatabase} from '../Index.js'
import productRouter from '../src/routes/Product.routes.js'
import router from "../src/routes/Product.routes.js";


jest.mock('chalk', () =>({
  bold: jest.fn().mockImplementation((text) => text),
  whiteBright: jest.fn().mockImplementation((text) => text),
  bold: {
    red: jest.fn().mockImplementation((text) => text),
  },

}))


describe('Product Router', () => {
  let testServer;
  let app;


  beforeAll(() => {
    testServer = new Server(3000, '127.0.0.1', [], []);
    app = testServer.getApp(); 
    app.use('/api/products', productRouter); 
  });


  test('should list products when products are available', async () => {
    const response = await request(app).get('/api/products');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();

    if (response.body.length > 0) {
      expect(response.body.length).toBeGreaterThan(0);
    } else {
      expect(response.body).toHaveLength(0);
    }
  });

  afterAll( async () => {
    testServer.close(); 
    await mongoose.disconnect();
  });


});

