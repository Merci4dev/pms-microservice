/**
 * This function creates a mock CSV file by reading the content from an existing CSV file and saving it to a temporary location.
 *The file path to the created mock CSV file.
*/

import fs from 'fs';
import os from 'os';
import path from 'path';

function createMockCsvFile() {
    const csvFilePath = path.join(__dirname, './italian_restaurant.csv'); // Ajusta esta ruta

    console.log(csvFilePath);

    const csvContent = fs.readFileSync(csvFilePath, 'utf8');

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, 'mockProducts.csv');

    fs.writeFileSync(tempFilePath, csvContent);

    return tempFilePath;
}

export default createMockCsvFile;

