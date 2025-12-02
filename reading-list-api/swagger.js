const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: { title: 'Reading List API', description: 'API for managing a reading list with books', version: '1.0.0' },
  host: 'localhost:3000',
  schemes: ['http'],            // keep http locally
  basePath: '/',       // <- IMPORTANT: matches app.use('/api/books', booksRoutes)
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [{ name: 'Books', description: 'API endpoints for managing books' }],
  definitions: {
    Book: {
      _id: '6750c6f2a2a9a3f1b5e5b123',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      publishedYear: 1925,
      genre: 'Classic',
      pages: 180,
      status: 'to-read'
    },
    BookCreate: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      publishedYear: 1925,
      genre: 'Classic',
      pages: 180,
      status: 'to-read'
    }
  }
};

const outputFile = './swagger.json';
// Let autogen see the mount by pointing at server.js or keep routes file with basePath above
const endpointsFiles = ['./server.js']; // or ['./routes/book.routes.js']
swaggerAutogen(outputFile, endpointsFiles, doc);