// Database.js
import mongoose from 'mongoose';

class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  connect() {
    return mongoose.connect(this.connectionString, {
      useUnifiedTopology: true
    });
  }

  // Añadir método para desconectar la base de datos
  disconnect() {
    return mongoose.disconnect();
  }
}

export default Database;


