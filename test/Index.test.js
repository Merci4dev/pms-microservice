import Server from "../Server.js";
import { app, database, connectToDatabase } from "../Index.js";

jest.mock('chalk', () =>({
    whiteBright: jest.fn().mockImplementation((text) => text),
}))


describe('Index Module', () => {
    let server;
  
    beforeAll(async () => {
      server = new Server(3000, '127.0.0.1', [], []);
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
  