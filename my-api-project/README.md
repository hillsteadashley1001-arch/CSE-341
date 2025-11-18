## API Documentation

### Contacts API

#### GET /contacts
- Description: Retrieves all contacts
- Response: 200 OK with array of contacts
- Error: 500 Internal Server Error

#### GET /contacts/:id
- Description: Retrieves a specific contact by ID
- Parameters: id (MongoDB ObjectID)
- Response: 200 OK with contact object
- Error: 404 Not Found, 400 Bad Request, 500 Internal Server Error

#### POST /contacts
- Description: Creates a new contact
- Body: Contact object (JSON)
  - firstName (required): string
  - lastName (required): string
  - email (required): valid email string
  - favoriteColor (required): string
  - birthday (required): string
- Response: 201 Created with the new contact ID
- Error: 400 Bad Request, 500 Internal Server Error

#### PUT /contacts/:id
- Description: Updates an existing contact
- Parameters: id (MongoDB ObjectID)
- Body: Contact object (JSON)
  - firstName (required): string
  - lastName (required): string
  - email (required): valid email string
  - favoriteColor (required): string
  - birthday (required): string
- Response: 204 No Content
- Error: 400 Bad Request, 404 Not Found, 500 Internal Server Error

#### DELETE /contacts/:id
- Description: Deletes a specific contact
- Parameters: id (MongoDB ObjectID)
- Response: 204 No Content
- Error: 400 Bad Request, 404 Not Found, 500 Internal Server Error