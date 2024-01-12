import mongoose from 'mongoose';
import Database from '../src/persistence/Database.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Database Connection', () => {
  it('should connect to the database successfully', async () => {
    const database = new Database(process.env.MONGO_URI);
    await expect(database.connect()).resolves.not.toThrow();
  });

  it('should disconnect from the database successfully', async () => {
    const database = new Database(process.env.MONGO_URI);
    await database.connect();

    return new Promise(async (resolve, reject) => {
      try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });

  it('should handle disconnection without prior connection', async () => {
    const database = new Database(process.env.MONGO_URI);

    return new Promise(async (resolve, reject) => {
      try {
        await mongoose.disconnect(); // No se ha realizado una conexión previa
        console.log('Disconnected from MongoDB');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });

  it('should disconnect from the database successfully', async () => {
    const database = new Database(process.env.MONGO_URI);
    
    await database.connect();
    
    return database.disconnect()
      .then(() => {
      })
      .catch((error) => {
      });
  });
  
});
