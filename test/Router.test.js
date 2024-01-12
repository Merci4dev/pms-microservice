
import Server from "../Server.js";
import { server, connectToDatabase } from '../index.js';
import productRouter from '../src/routes/Products.js';
const multer = require('multer');


describe('Product Router', () => {
  let testServer;

  beforeAll(async () => {
    testServer = new Server(3000, [], [ { path: '/api/products', router: productRouter } ]);
    
    testServer.applyRoutes();
    connectToDatabase();
  });

  it('should import data from CSV file and insert into the database', async () => {

  })

  afterAll(() => {
    server.close(); 
  });

});
