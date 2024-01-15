/**
 * This script configures and starts an Express server, connecting to MongoDB if not in test mode.
 * It sets up middleware and routes, and starts the server on the specified port.
 * If in test mode, it skips the MongoDB connection.
*/

import express from 'express'
import Server from './Server.js';
import chalk  from 'chalk';
import dotenv from 'dotenv';
import productRoutes from './src/routes/Product.routes.js';
import Database, {
    DatabaseConnectionError
} from './src/persistence/Database.js';

dotenv.config();

const middleware = [
    express.json(),
]

const routes = [
    { path: '/api/products', router: productRoutes },
  ];

// Database connection
const database = new Database(process.env.MONGO_URI)


async function connectToDatabase(uri = process.env.MONGO_URI) {
    try {
      console.log(chalk.whiteBright('Searching for DB connection...'));
      await database.connect(uri);
      console.log('Connected to MongoDB Successfully');
    } catch (error) {
      // Manejo de errores
      if (error instanceof DatabaseConnectionError) {
        console.error(error.message);
        throw error;
      } else {
        console.error('Unexpected error: ', error);
        throw new DatabaseConnectionError('Error connecting to the database');
      }
    }
}
  
connectToDatabase();

// Create  an server instancie 
const server = new Server(process.env.PORT, process.env.HOST, middleware, routes);

server.applyMiddleware();
server.applyRoutes();
// Inicia el servidor
server.listen();

const  app = server.getApp();

export {app, server, database, connectToDatabase}

