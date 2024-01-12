
/**
 * Server class encapsulates the logic for configuring and starting an Express server.
 * It applies middlewares and routes to the Express application.
 * The `listen` method starts the server on the specified port.
 * The structure is clear and modular, making it easy to manage the server and potentially expand it with more middlewares or routes.
 */

import express from 'express';

class Server {
  constructor(port, middlewares, routes) {
    this.app = express();
    this.port = port;
    this.middlewares = middlewares;
    this.routes = routes;
  }

  applyMiddleware() {
    this.middlewares.forEach(middleware => {
      this.app.use(middleware);
    });
  }

  applyRoutes() {
    this.routes.forEach(route => {
      this.app.use(route.path, route.router);
    });
  }

  listen() {
    this.server = this.app.listen(this.port, () => {
      console.log(`Server is running at http://127.0.0.1:${this.port}`);
    });
  }

  close() {
    if (this.server) {
      this.server.close();
    }
  }
  
  getApp() {
    return this.app;
  }

}

export default Server;









