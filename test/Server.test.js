// Server.test.js
import Server from "../Server.js";
import 'jest-express'; 
import request from 'supertest';


describe('Server class', () => {
  let server;

  beforeAll(() => {
    server = new Server(3000, [], []);
  });
  

  test('constructor should initialize properties', () => {
    expect(server.port).toBe(3000);
    expect(server.middlewares).toEqual([]);
    expect(server.routes).toEqual([]);
  });


  test('should apply all middlewares', async () => {
    const mockMiddleware = jest.fn((req, res, next) => next());
    server = new Server(3000, [mockMiddleware], []);
    server.applyMiddleware();
    await request(server.app).get('/');

    expect(mockMiddleware).toHaveBeenCalled();
  });


  test('should handle empty middlewares array', () => {
    expect(() => {
      server.applyMiddleware();
    }).not.toThrow();
  });

  afterAll(() => {
    server.close();
  });

});
