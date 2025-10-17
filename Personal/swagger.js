// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

module.exports = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Contacts API', version: '1.0.0', description: 'CSE 341 Contacts API' },
    servers: [
      { url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}` }
    ],
    components: {
      schemas: {
        Contact: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Mongo ObjectId' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            favoriteColor: { type: 'string' },
            birthday: { type: 'string', example: '1990-01-01' }
          },
          required: ['firstName','lastName','email']
        },
        Error: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    paths: {
      '/contacts': {
        get: {
          summary: 'Get all contacts',
          responses: {
            200: {
              description: 'List of contacts',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Contact' } } } }
            }
          }
        },
        post: {
          summary: 'Create a contact',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } }
          },
          responses: {
            201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
            400: { description: 'Bad Request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/contacts/{id}': {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Mongo ObjectId' }],
        get: {
          summary: 'Get contact by id',
          responses: {
            200: { description: 'Contact', content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
            400: { description: 'Invalid id' },
            404: { description: 'Not Found' }
          }
        },
        put: {
          summary: 'Update contact by id',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } }
          },
          responses: {
            200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
            400: { description: 'Invalid id' },
            404: { description: 'Not Found' }
          }
        },
        delete: {
          summary: 'Delete contact by id',
          responses: {
            204: { description: 'Deleted' },
            400: { description: 'Invalid id' },
            404: { description: 'Not Found' }
          }
        }
      }
    }
  },
  apis: []
});