// import fs from 'fs'
// import os from 'os'
// import path from 'path';
//  import csv from './italian_restaurant.csv'

// function createMockCsvFile() {
//     // Ruta al archivo CSV
//     const csvFilePath = './italian_restaurant.csv'; 

//     // Leer el contenido del archivo CSV
//      const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  
//     // const csvContent = `id,title,link,image_link,ingredients,diet,pizza_type,category,price,sale_price,explanation,rating,rating_count,stock\n` +
//     //                    `1,"Pizza Margherita","https://en.wikipedia.org/wiki/Pizza_Margherita","https://upload.wikimedia.org/wikipedia/commons/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg","tomato sauce,cheese","vegetarian","neapolitan","main",9.9,8.9,"Margherita tastes good",4.0,56,"In Stock"\n` +
//     //                    `2,"Pizza Pepperoni","https://example.com/pizza_pepperoni","https://example.com/image_pepperoni.jpg","tomato sauce,cheese,pepperoni","meat","neapolitan","main",12.9,null,"Pepperoni tastes good",4.5,100,"In Stock"`;

// //   const csvContent = `id,title,quantity\n1,Pizza Margherita,10\n2,Pizza Pepperoni,20`;

//   // Crear un archivo temporal
//   const tempDir = os.tmpdir();
//   const filePath = path.join(tempDir, 'mockProducts.csv');

//   // Escribir en el archivo temporal
//   fs.writeFileSync(filePath, csvContent);

//   return filePath;
// }

// export default createMockCsvFile



import fs from 'fs';
import os from 'os';
import path from 'path';

// const fs = require('fs');

// function createEmptyMockCsvFile() {
//   const emptyCsvFilePath = 'empty.csv';
//   fs.writeFileSync(emptyCsvFilePath, ''); // Crear un archivo CSV vacío
//   return emptyCsvFilePath;
// }

function createMockCsvFile() {
    // Ruta al archivo CSV
    const csvFilePath = './italian_restaurant.csv'; // Asegúrate de que la ruta sea correcta

    // Leer el contenido del archivo CSV
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');

    // Crear un archivo temporal
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, 'mockProducts.csv');

    // Escribir en el archivo temporal
    fs.writeFileSync(tempFilePath, csvContent);

    return tempFilePath;
}

export default createMockCsvFile;
// export default {createMockCsvFile, createEmptyMockCsvFile};
