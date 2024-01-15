
import mongoose from "mongoose";
import Database, {DatabaseConnectionError} from "../src/persistence/Database.js";
import dotenv from 'dotenv';

dotenv.config();


jest.mock('chalk', () =>({
  bold: jest.fn().mockImplementation((text) => text),
  bold: {
    red: jest.fn().mockImplementation((text) => text),
  },
}))


describe('Database Connection Class', () => {
  
  let mongoServer; 
  const database = new Database(process.env.MONGO_URI);

  beforeAll(async () => {
    // mongoServer = await MongoMemoryServer.create();
  });

  afterAll(async () => {

    if (database.isConnected()) {
      await database.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  });


  test('should connect to the database successfully', async () => {
    try {
      console.log(chalk.whiteBright('Searching for DB connection...'));
      await database.connect();
      console.log('Connected to MongoDB Successfully');
    } catch (error) {
      if (error instanceof DatabaseConnectionError) {
      }
    }
  });
  

  it('should disconnect from the database successfully', async () => {
    await database.connect();
  
    return new Promise(async (resolve, reject) => {
      try {
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        if (database.isConnected()) {
          await database.disconnect();
        }
      }
    });
  });
  

  it('should handle disconnection without prior connection', async () => {

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



  it('should handle connection attempts after prior connection without disconnection', async () => {
    const databaseWithoutDisconnect = new Database(process.env.MONGO_URI);
  
    try {
      await databaseWithoutDisconnect.connect();
      mongoose.connection.close(); 
      await databaseWithoutDisconnect.connect();
      
      fail('Expected ReferenceError but no exception was thrown');
    } catch (error) {
      if (error instanceof ReferenceError) {
        expect(error).toBeInstanceOf(ReferenceError);
      } else if (error instanceof DatabaseConnectionError) {
        expect(error).toBeInstanceOf(DatabaseConnectionError);
      }
    }
  });


  it('should handle connection failure', async () => {
    const databaseWithConnectionError = new Database('invalid_connection_string'); 

    try {
      await databaseWithConnectionError.connect();
      fail('Expected DatabaseConnectionError but no exception was thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(DatabaseConnectionError);
    }
  });

  afterEach(async () => {
    if (database.isConnected()) {
      await database.disconnect();
    }
  });

})