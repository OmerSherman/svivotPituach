# Shvil HaTahina - Backend API

Assignment 2 | Omer Sherman, Hillel Zilberman, Michal Adam

---

## How to install and run

```bash
npm install
node main.js
```

The server runs on port 3000.
Base URL: `http://localhost:3000`
API base path: `/api`

---

## Assumptions

- No database is used in this assignment. All data is stored in JSON files and loaded into memory when the server starts. Any changes made via POST, PUT or DELETE will be lost when the server restarts.
- Authentication is simulated using a request header called `x-user-role`. To access protected routes, add this header to the request with one of these values: `admin`, `manager`, `user`.
- IDs are generated using `array.length + 1`. This works fine for mock data but would be replaced with auto-increment in a real database.
- The base URL for all endpoints is `http://localhost:3000`.

---

## Response format

All responses follow the same structure:

Success response:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "description of what went wrong",
    "details": {}
  }
}
```

---

## API Reference

### Auth

No authentication required for these routes.

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | create a new account |
| POST | /api/auth/login | login with an existing account |

**POST /api/auth/register**

Request body:
```json
{
  "firstName": "dana",
  "lastName": "levi",
  "email": "dana@example.com",
  "password": "1234"
}
```

Success (201):
```json
{ "success": true, "data": { "userId": 5 }, "error": null }
```

Missing fields (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "please fill in all fields", "details": {} } }
```

**POST /api/auth/login**

Request body:
```json
{
  "email": "michal@example.com",
  "password": "1234"
}
```

Success (200):
```json
{ "success": true, "data": { "userId": 1, "firstName": "michal", "userRole": "admin" }, "error": null }
```

Wrong password (401):
```json
{ "success": false, "data": null, "error": { "code": "UNAUTHORIZED", "message": "wrong email or password", "details": {} } }
```

---

### Users

Protected routes require the `x-user-role` header.

| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| GET | /api/users | get all users | admin |
| GET | /api/users/:id | get one user by id | open |
| POST | /api/users | create a new user | admin |
| PUT | /api/users/:id | update a user | admin, manager |
| DELETE | /api/users/:id | delete a user | admin |

**POST /api/users**

Request body:
```json
{
  "firstName": "yael",
  "lastName": "cohen",
  "userRole": "user"
}
```

Success (201):
```json
{ "success": true, "data": { "userId": 5 }, "error": null }
```

**PUT /api/users/:id**

Request body (only send the fields you want to update):
```json
{ "firstName": "updated name" }
```

Success (200):
```json
{ "success": true, "data": { "userId": 4 }, "error": null }
```

**DELETE /api/users/:id**

Success (200):
```json
{ "success": true, "data": { "userId": 4 }, "error": null }
```

Not found (404):
```json
{ "success": false, "data": null, "error": { "code": "NOT_FOUND", "message": "user 999 not found", "details": {} } }
```

No permission (403):
```json
{ "success": false, "data": null, "error": { "code": "FORBIDDEN", "message": "You do not have permission to perform this action.", "details": {} } }
```

---

### Attractions

| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| GET | /api/attractions | get all attractions | open |
| GET | /api/attractions/:id | get one attraction by id | open |
| POST | /api/attractions | create a new attraction | admin |
| PUT | /api/attractions/:id | update an attraction | admin, manager |
| DELETE | /api/attractions/:id | delete an attraction | admin |
| GET | /api/attractions/map | get map pins for a city | ?city_id |

Query parameters for GET /api/attractions:
- `type` — filter by type. values: `site`, `tour`, `route`. example: `?type=site`
- `city_id` — filter by city id. example: `?city_id=2`

**POST /api/attractions**

Required fields: `city_id`, `name`, `name_he`, `type`, `description_he`

Request body:
```json
{
  "city_id": 2,
  "name": "Palermo Soho",
  "name_he": "פאלרמו סוהו",
  "type": "site",
  "description_he": "שכונת הבוטיקים של בואנוס איירס"
}
```

Success (201):
```json
{ "success": true, "data": { "id": 13 }, "error": null }
```

Missing fields (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Missing required fields", "details": {} } }
```

Invalid type (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "type must be one of: site, tour, route", "details": { "field": "type" } } }
```

---

### Cities

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/cities | get all cities |
| GET | /api/cities/search | search cities by name |
| GET | /api/cities/:id | get one city by id |

Query parameter for search: `q` (required). example: `?q=buenos`
Search works in both English and Hebrew.

Search success (200):
```json
{ "success": true, "data": [{ "id": 2, "name": "Buenos Aires", "name_he": "בואנוס איירס" }], "error": null }
```

Missing query (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "search query is required", "details": {} } }
```

---

### Favorites

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/favorites | get all favorites for a user |
| POST | /api/favorites | add an item to favorites |
| DELETE | /api/favorites/:id | remove item from favorites |

Query parameter for GET: `userId` (required). example: `?userId=1`

**POST /api/favorites**

Request body:
```json
{
  "userId": 1,
  "itemId": 3,
  "itemType": "attraction"
}
```

Success (201):
```json
{ "success": true, "data": { "id": 1 }, "error": null }
```

Already saved (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "this item is already in favorites", "details": {} } }
```

---

### Profile

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/profile | save or update traveler preferences |

If a profile already exists for the user, it gets updated. Otherwise a new one is created.

Request body:
```json
{
  "userId": 1,
  "travelerType": "couple",
  "interests": ["history", "food", "art"],
  "budgetLevel": "medium"
}
```

Created (201):
```json
{ "success": true, "data": { "userId": 1 }, "error": null }
```

Updated (200):
```json
{ "success": true, "data": { "userId": 1 }, "error": null }
```

---

## Middleware

**logger** — runs automatically on every request. logs the HTTP method, path, status code and response time to the console.

Example output:
```
[2026-05-02T14:48:15.000Z] method:GET path:/api/attractions status:200 duration:5ms
```

**roleCheck** — checks the `x-user-role` header on protected routes. if the role is missing or not allowed, returns 403.

To test protected routes in Postman, add this header:
```
Key:   x-user-role
Value: admin
```

## Map feature

Based on feedback received on the project spec, we added basic map support.

Each attraction includes `latitude` and `longitude` fields in the mock data.
We also added a dedicated endpoint that returns only the fields needed to display map pins:

GET /api/attractions/map?city_id=2

Response:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name_he": "לה בוקה", "type": "site", "latitude": -34.6345, "longitude": -58.3631 }
  ],
  "error": null
}
```

In the next stage this data will be used by the frontend map component