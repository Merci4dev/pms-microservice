/**
 * Server class encapsulates the logic for configuring and starting an Express server.
 * It applies middlewares and routes to the Express application.
 * The `listen` method starts the server on the specified port.
 * This structure is clear and modular, making it easy to manage the server and potentially expand it with more middlewares or routes.
*/

import express from 'express'

class Server {
    
    constructor(port, host, middlewares, routes)
    {
        // Validate port
        if(port < 0 || port > 65535) {
            throw new Error('Invalid Port Number')
        }
        
        // Validate host
        if(typeof host !== 'string' || host.trim() === '') {
            throw new Error('Invalid host')
        }

        // Validate middlewares
        if(!Array.isArray(middlewares) || !middlewares.every(mw => typeof mw === 'function')){
            throw new Error('Invalid middleware array')
        }
    
        if (!Array.isArray(routes) || !routes.every(route => typeof route.path === 'string')) {
            throw new Error("Invalid routes array");
        }

        this.app = express();
        this.host = host;
        this.port = port;
        this.middlewares = middlewares;
        this.routes = routes;
    }


    applyMiddleware() {
        this.middlewares.forEach(middleware => {
            this.app.use(middleware)
        });
    }


    applyRoutes() {
        this.routes.forEach(route => {
          this.app.use(route.path, route.router);
        });
      }

    // Listen the app start
    listen(callback) {
        this.server = this.app.listen(this.port, this.host, () => {
            console.log(`Server is running at http://${this.host}:${this.port}`);
            if (callback) callback(null);
        });

        this.server.on('error', (error) => {
            if (callback) callback(error);

        });
    }


    close() {
        if(this.server){
            this.server.close()
        }
    }

    getApp () {
        return this.app
    }
}

export default Server





