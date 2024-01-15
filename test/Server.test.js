import Server from "../Server";
import request from 'supertest';
import express from 'express'
import router from "../src/routes/Product.routes";

jest.mock('chalk', () =>({
    yellow: jest.fn().mockImplementation((text) => text),
    italic: jest.fn().mockImplementation((text) => text),
}))

describe('Server Class', () => {
    let server;
    let mockServer;

    // Generate a random port between 3000 and 4000
    const testPort = Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000;
    
    beforeAll(done => {
        const app = express();
        mockServer = app.listen(testPort, done);
    });

    beforeEach(() => {
        // Use dynamically generated port to avoid conflicts
        server = new Server(testPort, '127.0.0.1', [], []);
    });

    afterAll(() => {
        if(mockServer){
            mockServer.close();
        }
    });

    afterEach(() => {
        if(server && server.server) {
            server.server.close();
        }
    })


    test('constructor should initialize properties', () => {
        const server = new Server(testPort, '127.0.0.1', [], []);
        expect(server.port).toBe(testPort);
        expect(server.middlewares).toEqual([]);
        expect(server.routes).toEqual([]);
    });
    
    test('should handle invalid input', () => {
        expect(() => new Server(-1, '127.0.0.1', [], [])).toThrow();
    });
    
    test('should throw error for invalid host', () => {
        expect(() => new Server(3000, '', [], [])).toThrow('Invalid host');
    });
    
    test('should throw error for invalid middlewares array', () => {
        expect(() => new Server(3000, '127.0.0.1', 'not-an-array', [])).toThrow('Invalid middleware array');
    });
    
    test('should throw error for invalid routes array', () => {
        expect(() => new Server(3000, '127.0.0.1', [], 'not-an-array')).toThrow('Invalid routes array');
    });
    
    test('should handle empty routes array', () => {
        const server = new Server(3000, '127.0.0.1', [], []);
        expect(() => server.applyRoutes([])).not.toThrow();
    });
    
    test('should handle empty middlewares array', () => {
        expect(() => {
            server.applyMiddleware();
        }).not.toThrow();
    });
    
    test('should start server successfully', done => {
        // Dynamic port allocation
        const dynamicPort = Math.floor(Math.random() * (5000 - 4000 + 1)) + 4000;
        const server = new Server(dynamicPort, '127.0.0.1', [], []);
    
        server.listen(error => {
            expect(error).toBeNull();
            server.close();
            done();
        });
    }, 5000);
    
    test('getApp should return an Express application', () => {
        const server = new Server(3000, '127.0.0.1', [], []);
        const app = server.getApp();
        expect(app).toBeDefined();
        expect(typeof app.use).toBe('function');
    });
    
    test('should apply all middlewares', async () => {
        const mockMiddleware = jest.fn((req, res, next) => next());
        server = new Server(testPort, '127.0.0.1', [mockMiddleware], []);
        server.applyMiddleware();
        await request(server.app).get('/');
        expect(mockMiddleware).toHaveBeenCalled();
    });
    
    test('should set up and handle routes correctly', async () => {
        // Initialize the server with routes
        const routes = [
            {
                path: '/test',
                router: express.Router()
                    .get('/', (req, res) => res.status(200)
                        .send('OK'))
            }];
    
        server = new Server(3000, '127.0.0.1', [], routes);
        server.applyRoutes();
    
        // Making a request to the test route
        const response = await request(server.getApp()).get('/test');
    
        // check the response
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('OK');
    });
    
    test('should close the server properly', done => {
        const server = new Server(3003, '127.0.0.1', [], []);
        server.listen(() => {
            server.close();
    
            // Attempt to start another server on the same port to check if it has been closed
            const anotherServer = new Server(3003, '127.0.0.1', [], []);
            anotherServer.listen(error => {
                expect(error).toBeNull();
                anotherServer.close();
                done();
            });
        });
    });
    
    test(`should handle EADDRINUSE error when the current port: ${testPort} is already in use`, done => {
        // Escuchar en un puerto que sabemos que está en uso (el del mockServer)
        server.port = testPort;
        server.listen(error => {
            try {
                expect(error).not.toBeNull();
                expect(error.code).toBe('EADDRINUSE');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
    
    test('should behave correctly on different hosts and ports', done => {
        const server = new Server(3005, '0.0.0.0', [], []);
        server.listen(error => {
            expect(error).toBeNull();
            server.close();
            done();
        });
    });
    
    test('should log server start message', async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        const newServer = new Server(3006, '127.0.0.1', [], []);
    
        // Wrap the server's listen method in a promise
        const serverStartedPromise = new Promise((resolve) => {
            newServer.listen(() => {
                resolve();
            });
        });
    
        await serverStartedPromise;
    
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Server is running at'));
    
        newServer.close();
        consoleSpy.mockRestore();
    });
    
}) 