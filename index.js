
/**
 * This script configures and starts an Express server, connecting to MongoDB if not in test mode.
 * It sets up middleware and routes, and starts the server on the specified port.
 * If in test mode, it skips the MongoDB connection.
 */

import dotenv from 'dotenv';
import express from 'express';
import productRoutes from './src/routes/Products.js';
import Server from './Server.js';
import Database from './src/persistence/Database.js';

dotenv.config();

const middlewares = [
  express.json(),
];

const routes = [
  { path: '/api/products', router: productRoutes },
];

const database = new Database(process.env.MONGO_URI);

function connectToDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    database.connect()
      .then(() => console.log('Connected to MongoDB'))
      .catch(error => {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
      });
  } else {
    console.log('Running in test mode - MongoDB connection skipped');
  }
}

connectToDatabase()

const server = new Server(process.env.PORT, middlewares, routes);

server.applyMiddleware();
server.applyRoutes();
// server.listen();

const app = server.getApp(); 
export { app, database, connectToDatabase, server}; 









