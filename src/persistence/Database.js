
/**
 * This module contains a database connection manager for MongoDB using Mongoose.
 */

import mongoose from 'mongoose';
import chalk from 'chalk'

/**
 * Custom error class for database connection issues.
*/
class DatabaseConnectionError extends Error {
    constructor(message) {
      super(message);
      this.name = "DatabaseConnectionError";
    }
}

/**
 * Custom error class for database disconnection issues.
*/
class DatabaseDisconnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = "DatabaseDisconnectionError";
    }
}

/**
 * Database class responsible for connecting to and disconnecting from MongoDB.
*/
class Database {
    constructor(connnectioString){
        this.connnectioString = connnectioString;
    }

    async connect() {
        try {
            await mongoose.connect(this.connnectioString, {
                // useUnifiedTopology: true
            });

        } catch (error) {
            throw new DatabaseConnectionError(chalk.bold.red('Failed to connect to MongoDB: ') + error.message);
        }
    }

    isConnected() {
        return mongoose.connection.readyState === 1;
    }

    
    async disconnect() {
        try {
            await mongoose.disconnect();

        } catch (error) {
            throw new DatabaseDisconnectionError(chalk.bold.red('Failed to disconnect from MongoDB: ') + error.message);

        }
    }
}

export default Database;
export {DatabaseConnectionError, DatabaseDisconnectionError};
