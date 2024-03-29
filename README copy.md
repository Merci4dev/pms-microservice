# pms-microservice

## Description

This is a product management microservice for an e-commerce system. It provides API endpoints to import products from a CSV file, sell products, list products, get product recommendations, and check product availability.

## Installation

To run this microservice in your local environment, follow these steps:

1. Clone this repository:
https://github.com/Merci4dev/pms-microservice.git

2. Install dependencies:
npm install

3. Set up environment variables:
Create a `.env` file in the project's root directory and define necessary environment variables like the database connection string and port.

MONGO_URI=mongodb://localhost:27017/pms-microservice
PORT=3000
NODE_ENV=development
# NODE_ENV=test

4. Run the microservice:
npm run dev

The microservice will be available at `http://localhost:3000`.

## Directory Structure

The project directory structure is organized as follows:

- `src/`: Contains the microservice's source code.
- `controllers/`: Controllers to handle HTTP requests.
- `models/`: Data model definitions.
- `persistence/`: Classes for data persistence.
- `routes/`: API route definitions.
- `test/`: Contains unit and integration tests.
- `coverage/`: Code coverage reports generated by tests.

## Usage

You can use the following routes to interact with the microservice:

- `POST /api/products/import`: Import products from a CSV file.
- `POST /api/products/sell`: Sell products.
- `GET /api/products`: List products with filtering, pagination, and sorting options.
- `GET /api/products/recommendations/:id`: Get product recommendations based on a product ID.
- `GET /api/products/check-availability`: Check product availability by ID or title.
- `GET /api/products/frequently-bought-together`: Get frequently bought together products.

## Testing

The project includes unit and integration tests. You can run the tests using the following command:

    npm test

## Code Coverage

Code coverage is automatically generated after running the tests. You can find coverage reports in the `coverage/` folder.

## Contribution

If you'd like to contribute to this project, we welcome collaborations! Feel free to create issues or submit pull requests in the repository.

## License

This project is licensed under the [ISC License](LICENSE).
