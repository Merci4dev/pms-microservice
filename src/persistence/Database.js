
/**
 * Database class encapsulates MongoDB database connection and disconnection logic using Mongoose.
 */

import mongoose from 'mongoose';

class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connection = null;
  }

  async connect() {
    this.connection = await mongoose.connect(this.connectionString, {
      // useUnifiedTopology: true
    });
  }

  async disconnect() {
    if (!this.connection) {
      return Promise.resolve(); 
    }

    return new Promise((resolve, reject) => {
      this.connection.then(() => {
        mongoose.connection.close();
        console.log('Disconnected from MongoDB');
        resolve(); 
      }).catch((error) => {
        console.error('Error while disconnecting from MongoDB', error);
        reject(error);
      });
    });
  }
}

export default Database;


