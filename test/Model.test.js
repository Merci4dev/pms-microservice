

import mongoose from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
import fs from 'fs'
import { app } from '../index.js';
import  createMockCsvFile  from '../persistence/TemporalCSV.js'
import { Product } from '../src/models/Products.js';

dotenv.config();


describe('Product Model Test', () => {
  
  beforeAll(async () => {
    // console.log('Conectando a:', process.env.MONGO_URI);
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Conexión exitosa');
    } catch (error) {
      console.error('Error al conectar a MongoDB:', error);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('create & save product successfully', async () => {
    // Mock del archivo CSV
    const mockCsvFilePath = createMockCsvFile();
    const response = await request(app)
    .post('/api/products/import') // Reemplaza con la ruta correcta de tu endpoint
    .attach('file', mockCsvFilePath); // 'file' debe coincidir con el nombre del campo en tu endpoint

    expect(response.status).toBe(200); // O lo que esperes como respuesta exitosa
    expect(response.text).toBe('Productos importados correctamente.');

    // Verificar que los productos se hayan insertado en la base de datos
    // const productsInDb = await Product.find({});
    // expect(productsInDb).toHaveLength(/* número esperado de productos */)

    // Limpieza: Borrar el archivo CSV después de la prueba
    fs.unlinkSync(mockCsvFilePath);
  });



  it('handle invalid CSV file', async () => {
    // Mock de un archivo CSV inválido
    const mockCsvFilePath = '';

    // Realizar la petición con el archivo inválido
    const response = await request(app)
      .post('/api/products/import')
      .attach('file', mockCsvFilePath);
  
    // Verificar la respuesta
    expect(response.status).toBe(500);
    // expect(response.body.error).toBe('Error al procesar el archivo CSV');

  });
  

  it('handle database insertion error', async () => {
    // Mock del archivo CSV
    const mockCsvFile = createMockCsvFile();
  
    // Mockear el método insertMany para que falle
    jest.spyOn(Product, 'insertMany').mockImplementationOnce(() => Promise.reject(new Error('Error en la base de datos')));

  
    // Realizar la petición
    const response = await request(app).post('/api/products/import').attach('file', mockCsvFile);
  
    // Verificar la respuesta
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Error al insertar productos en la base de datos');
  });
  

});
