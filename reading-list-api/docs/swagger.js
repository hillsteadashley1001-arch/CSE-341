// docs/swagger.js (CommonJS)
const swaggerJSDoc = require('swagger-jsdoc');

const currentYear = new Date().getFullYear();

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Reading List API',
      version: '1.0.0',
      description: 'Books, Reviews, and Auth endpoints',
    },
    servers: [
      { url: process.env.BASE_URL || 'http://localhost:3000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            owner: { type: 'string' },
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string' },
            publishedYear: { type: 'integer', minimum: 1450, maximum: currentYear },
            genre: { type: 'string' },
            pages: { type: 'integer', minimum: 1 },
            status: { type: 'string', enum: ['to-read', 'reading', 'read'] },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BookCreate: {
          type: 'object',
          required: ['title','author','isbn','publishedYear','genre','pages','status'],
          properties: {
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string', description: '10 or 13 alphanumeric; hyphens/spaces allowed in input' },
            publishedYear: { type: 'integer', minimum: 1450, maximum: currentYear },
            genre: { type: 'string' },
            pages: { type: 'integer', minimum: 1 },
            status: { type: 'string', enum: ['to-read','reading','read'] },
            rating: { type: 'number', minimum: 0, maximum: 5 },
          },
        },
        BookUpdate: {
          type: 'object',
          description: 'Partial update fields',
          properties: {
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string' },
            publishedYear: { type: 'integer', minimum: 1450, maximum: currentYear },
            genre: { type: 'string' },
            pages: { type: 'integer', minimum: 1 },
            status: { type: 'string', enum: ['to-read','reading','read'] },
            rating: { type: 'number', minimum: 0, maximum: 5 },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            book: { type: 'string' },
            reviewer: { type: 'string' },
            text: { type: 'string', minLength: 5 },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ReviewCreate: {
          type: 'object',
          required: ['text','rating'],
          properties: {
            text: { type: 'string', minLength: 5 },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
          },
        },
        ReviewUpdate: {
          type: 'object',
          properties: {
            text: { type: 'string', minLength: 5 },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
          },
        },
        ListBooksResponse: {
          type: 'object',
          required: ['items','total','page','pages','limit'],
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            pages: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
        ListReviewsResponse: {
          type: 'object',
          required: ['items','total','page','pages','limit'],
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            pages: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    tags: [{ name: 'Auth' }, { name: 'Books' }, { name: 'Reviews' }],
    paths: {
      // Informational only (browser redirect), optional
      '/auth/google': {
        get: {
          tags: ['Auth'],
          summary: 'Start Google OAuth (browser redirect)',
          responses: { '302': { description: 'Redirect to Google' } },
        },
      },
      '/auth/google/callback': {
        get: {
          tags: ['Auth'],
          summary: 'Google OAuth callback (sets cookie and redirects)',
          responses: { '302': { description: 'Redirect to /docs (or configured page)' } },
        },
      },

      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout (clear auth cookie)',
          security: [{ cookieAuth: [] }],
          responses: { '204': { description: 'No Content' }, '401': { description: 'Unauthorized' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Current user',
          security: [{ cookieAuth: [] }],
          responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } },
        },
      },

      '/api/books': {
        get: {
          tags: ['Books'],
          summary: 'List books',
          parameters: [
            { in: 'query', name: 'q', schema: { type: 'string' } },
            { in: 'query', name: 'genre', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['to-read','reading','read'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ListBooksResponse' },
                  examples: {
                    empty: { value: { items: [], total: 0, page: 1, pages: 1, limit: 20 } },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Books'],
          summary: 'Create a book',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BookCreate' } } },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Book' },
                  examples: {
                    created: {
                      value: {
                        owner: '64f0a3c7e9c9d4e6b12a34cd',
                        title: 'Clean Code',
                        author: 'Robert C. Martin',
                        isbn: '0132350882',
                        publishedYear: 2008,
                        genre: 'Software',
                        pages: 464,
                        status: 'to-read',
                        rating: 4,
                        _id: '64f0a4dce9c9d4e6b12a34ce',
                        createdAt: '2025-12-04T22:18:26.639Z',
                        updatedAt: '2025-12-04T22:18:26.639Z',
                        __v: 0,
                      },
                    },
                  },
                },
              },
            },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized' },
          },
        },
      },

      '/api/books/{id}': {
        get: {
          tags: ['Books'],
          summary: 'Get book by id',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } },
            },
            '404': { description: 'Not found' },
          },
        },
        put: {
          tags: ['Books'],
          summary: 'Update a book (partial)',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BookUpdate' } } },
          },
          responses: {
            '200': {
              description: 'Updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Book' },
                  examples: {
                    updated: {
                      value: {
                        _id: '64f0a4dce9c9d4e6b12a34ce',
                        owner: '64f0a3c7e9c9d4e6b12a34cd',
                        title: 'Clean Code',
                        author: 'Robert C. Martin',
                        isbn: '0132350882',
                        publishedYear: 2008,
                        genre: 'Software',
                        pages: 464,
                        status: 'reading',
                        rating: 4.5,
                        createdAt: '2025-12-04T22:18:26.639Z',
                        updatedAt: '2025-12-04T22:19:23.075Z',
                        __v: 0,
                      },
                    },
                  },
                },
              },
            },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' },
            '404': { description: 'Not found' },
          },
        },
        delete: {
          tags: ['Books'],
          summary: 'Delete a book',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            '204': { description: 'Deleted' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' },
            '404': { description: 'Not found' },
          },
        },
      },

      '/api/books/{bookId}/reviews': {
        get: {
          tags: ['Reviews'],
          summary: 'List reviews for a book',
          parameters: [
            { in: 'path', name: 'bookId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 }, example: 1 },
            { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 }, example: 20 },
            { in: 'query', name: 'sort', schema: { type: 'string', enum: ['new','top'] }, example: 'new' },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ListReviewsResponse' },
                  examples: {
                    empty: { value: { items: [], total: 0, page: 1, pages: 1, limit: 20 } },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Reviews'],
          summary: 'Create a review',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'bookId', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewCreate' } } },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Review' },
                  examples: {
                    created: {
                      value: {
                        book: '64f0a4dce9c9d4e6b12a34ce',
                        reviewer: '64f0a3c7e9c9d4e6b12a34cd',
                        text: 'Great!',
                        rating: 5,
                        _id: '64f0a6a238b3a0547b55c4f0',
                        createdAt: '2025-12-04T22:27:51.676Z',
                        updatedAt: '2025-12-04T22:27:51.676Z',
                        __v: 0,
                      },
                    },
                  },
                },
              },
            },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized' },
          },
        },
      },

      '/api/reviews/{id}': {
        put: {
          tags: ['Reviews'],
          summary: 'Update a review (partial)',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewUpdate' } } },
          },
          responses: {
            '200': {
              description: 'Updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Review' },
                  examples: {
                    updated: {
                      value: {
                        _id: '64f0a6a238b3a0547b55c4f0',
                        book: '64f0a4dce9c9d4e6b12a34ce',
                        reviewer: '64f0a3c7e9c9d4e6b12a34cd',
                        text: 'Great!',
                        rating: 4,
                        createdAt: '2025-12-04T22:27:51.676Z',
                        updatedAt: '2025-12-04T22:29:14.248Z',
                        __v: 0,
                      },
                    },
                  },
                },
              },
            },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' },
            '404': { description: 'Not found' },
          },
        },
        delete: {
          tags: ['Reviews'],
          summary: 'Delete a review',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            '204': { description: 'Deleted' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' },
            '404': { description: 'Not found' },
          },
        },
      },
    },
  },
  apis: [],
});

module.exports = { swaggerSpec };