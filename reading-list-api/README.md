# Reading List API — How to run and test

## 1) Prerequisites

- Node.js 18+ (Node 24.x works)
- MongoDB Atlas connection string
- Google OAuth2 Web Client (Client ID and Client Secret)

## 2) Environment variables (.env)

Create a .env file at project root:

```
PORT=3000
MONGODB_URI=YOUR_ATLAS_SRV_URI
JWT_SECRET=super-secret
CORS_ORIGIN=http://localhost:3000
BASE_URL=http://localhost:3000

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
OAUTH_CALLBACK_URL=http://localhost:3000/auth/google/callback
POST_AUTH_REDIRECT=/docs
```

## 3) Install and run

```
npm install
npm run dev     # or: npm run start
```

You should see “MongoDB connected” and “API on http://localhost:3000”.

Health check:

- http://localhost:3000/health → 200 OK

## 4) Sign in with Google (sets a JWT cookie)

- In the same browser window you’ll use for Swagger:
    - Go to http://localhost:3000/auth/google
    - Complete Google consent
    - Verify: http://localhost:3000/auth/me returns your profile with id as a 24‑char Mongo ObjectId

Note: /auth/google is a browser redirect flow (not a JSON “Try it out” in Swagger).

## 5) Open Swagger UI

- http://localhost:3000/docs
- Servers should show http://localhost:3000

Swagger is configured to include cookies; if you signed in in the same browser/tab, protected endpoints will work.

## 6) Test the API (exact steps)

### Books

1) List (public)

- GET /api/books → 200 with items array

2) Create (auth required)

- POST /api/books
- Body:

```
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "0132350882",
  "publishedYear": 2008,
  "genre": "Software",
  "pages": 464,
  "status": "to-read",
  "rating": 4
}
```

- Expect 201 with _id and owner

3) Get by id (public)

- GET /api/books/{id} → 200

4) Update (auth + owner)

- PUT /api/books/{id}
- Body:

```
{ "status": "reading", "rating": 4.5 }
```

- Expect 200

5) Delete (auth + owner)

- DELETE /api/books/{id} → 204

### Reviews

1) List for a book (public)

- GET /api/books/{bookId}/reviews → 200 with items

2) Create (auth required)

- POST /api/books/{bookId}/reviews
- Body:

```
{ "text": "Great!", "rating": 5 }
```

- Expect 201 with review _id

3) Update (auth + reviewer)

- PUT /api/reviews/{id}
- Body:

```
{ "rating": 4 }
```

- Expect 200

4) Delete (auth + reviewer)

- DELETE /api/reviews/{id} → 204

### Auth helpers

- GET /auth/me → current user
- POST /auth/logout → clears the cookie (you can add GET /auth/logout if desired)

## 7) What the app enforces

- Auth: Cookie‑based JWT (HttpOnly). Sign in via /auth/google.
- Ownership: Only the creator can update/delete a book or review.
- Validation:
    - isbn must be 10 or 13 alphanumeric after removing hyphens/spaces
    - publishedYear ≥ 1450 and ≤ current year
    - pages ≥ 1
    - status ∈ to-read | reading | read
    - review text length ≥ 5, rating 1–5

## 8) Troubleshooting

- Swagger returns 401 on POST/PUT/DELETE
    - Sign in at /auth/google in the same tab
    - /auth/me must show a 24‑char Mongo ObjectId
    - Servers in /docs must be http://localhost:3000
- “Cast to ObjectId failed for value '1076…' at path 'owner'”
    - Re‑login so the JWT contains Mongo userId (not the Google numeric id)
    - /auth/me must show ObjectId
- Requests “keep loading”
    - Check /health (200)
    - Controllers fail fast with 5s DB timeout; if you see 504, verify MONGODB_URI and Atlas IP allowlist
- Cookies not sent in Swagger
    - CORS_ORIGIN must equal http://localhost:3000
    - Swagger is set with withCredentials and requestInterceptor to include cookies

## 9) Deploy (Render)

Set env vars:

- MONGODB_URI, JWT_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- OAUTH_CALLBACK_URL=https://YOUR-APP.onrender.com/auth/google/callback
- CORS_ORIGIN=https://YOUR-APP.onrender.com
- BASE_URL=https://YOUR-APP.onrender.com

Re‑test:

- /auth/google → sign in
- /auth/me → profile with ObjectId
- /docs → Try it out for protected routes