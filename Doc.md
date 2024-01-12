# Product Management System Microservice

1. Package.json and Dependencies
{
  "devDependencies": {
    "@babel/core": "^7.23.7",
    "@babel/preset-env": "^7.23.8",
    "@babel/register": "^7.23.7",
    "jest": "^29.7.0",
    "jest-express": "^1.12.0",
    "jest-fs": "^1.0.2",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  },
  "dependencies": {
    "csv-parser": "^3.0.0",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongoose": "^8.0.4",
    "multer": "^1.4.5-lts.1"
  }
}

# Server Class
The Server class is responsible for configuring and running an Express server. It receives the port on which it will run, a list of middlewares, and a list of routes as parameters in its constructor.

applyMiddleware(): This method applies the middlewares to the Express server.

applyRoutes(): This method applies the routes to the Express server.

listen(): Initiates the server on the specified port and displays a message in the console when the server is up and running.

close(): Closes the server if it is running.

getApp(): Returns the instance of the Express application.


*Server Configuration and Database Connection*
The dotenv package is used to load environment variables from a .env file.

An instance of the Database class is created to manage the connection to the MongoDB database. If the environment is not set to "test," an attempt is made to connect to the database.

The connectToDatabase() function handles the database connection, displaying success or error messages.

An instance of the Server class is created, middlewares and routes are applied, and the server is started.


*Routes and Controllers*
The Products.js file contains routes related to product management. These routes are associated with methods in the ProductController. Endpoints are defined for importing products, selling products, listing products, getting product recommendations, checking product availability, and retrieving frequently bought together products.


*Environment Variables*
Environment variables are defined in the .env file to configure the database connection (MONGO_URI and PORT) and set the environment (NODE_ENV).

This documentation provides an overview of the code and its structure. If you need a more detailed description of any specific part of the code or have additional questions, please feel free to ask under[merci4dev@gmail.com].

*Usage Examples*
Here are some usage examples for the endpoints provided by the microservice:

1. Import Products
To import products from a CSV file, send a POST request to /api/products/import with the CSV file attached.

2. Sell Products
To sell products, send a POST request to /api/products/sell with a list of products to be sold.

3. List Products
To list products with various query parameters, send a GET request to /api/products.

4. Get Product Recommendations
To get product recommendations based on a product's ID, send a GET request to /api/products/recommendations/:id.

5. Check Product Availability
To check the availability of a product by ID or title, send a GET request to /api/products/check-availability.

6. Get Frequently Bought Together Products
To retrieve frequently bought together product pairs, send a GET request to /api/products/frequently-bought-together.

*Testing and Development*
The project includes scripts for testing and development, making it easy to maintain and enhance the microservice:

npm test: Runs tests using Jest to ensure the correctness of the codebase. Tests can be found in the test directory.

npm run dev: Utilizes Nodemon to run the microservice in development mode, automatically restarting the server on code changes.

npm run test:coverage: Generates a code coverage report using Jest, helping to identify areas of the code that may require additional testing.

*Project Structure*
The project follows a structured organization to enhance maintainability:

Controllers: The controllers directory contains controller classes, such as ProductController, responsible for handling HTTP requests and responses related to products.

Models: The models directory defines the schema for the Product and ProductPair models, allowing seamless interaction with the MongoDB database.

Persistence: The persistence directory manages the database connection with the Database class. It also contains other database-related functionality.

Routes: The routes directory houses route definitions, like Products.js, which map HTTP endpoints to controller methods.

Root Files: The root directory includes essential project files, such as Server.js for configuring the server and index.js for starting the microservice.

*Error Handling*
The microservice incorporates error handling to ensure robustness:

The handleErrorResponse function manages error responses consistently across the application. It logs errors and responds with an appropriate HTTP status code and error message.

Error handling in controller methods ensures that errors are caught, logged, and sent as informative responses to clients.

*Data Management*
The microservice leverages a MongoDB database for efficient data storage and retrieval:

Product data is structured using the Product schema, and the ProductPair schema is used to record frequently bought together products.

MongoDB queries are employed to search for products, track product recommendations, and identify product pairs that are frequently bought together.

*Extensibility*
The project is designed with extensibility in mind:

Additional routes and controllers can be easily added to accommodate new features or functionality.

The code structure encourages modularity and separation of concerns, making it straightforward to maintain and scale.

*Documentation*
This README serves as a comprehensive guide to understanding and using the microservice. If you have any questions or require further assistance, please do not hesitate to reach out.

*Conclusion*
The Product Management System Microservice is a robust and extensible solution for handling various aspects of product management. Its well-organized codebase, error handling, and database integration make it a reliable choice for managing product-related data and operations in an e-commerce application.