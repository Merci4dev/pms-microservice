import { app, database, connectToDatabase } from '../index.js';
import Server from "../Server.js";
describe('Index', () => {
  let server;

  beforeAll(async () => {
    server = new Server(3000, [], []);
    await connectToDatabase();
  });

  it('should create an express app', () => {
    expect(app).toBeDefined();
  })


  afterAll(async () => {
    server.close();
    database.disconnect();
  });

})



