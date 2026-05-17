# Shvil HaTahina - Backend API

Assignment 2 | Omer Sherman, Hillel Zilberman, Michal Adam

---

## How to install and run

```bash
npm install
node app.js
```

Server runs on port 3000.
Base URL: `http://localhost:3000`
API base path: `/api`

---

## Assumptions

- No database is used in this assignment. All data is loaded from JSON files into memory when the server starts. Any changes made via POST, PUT or DELETE will reset when the server restarts.
- Authentication is simulated using a request header called `x-user-role`. To access protected routes, add this header with one of these values: `admin`, `manager`, `user`.
- For delete operations, a second header `x-user-id` is used to identify the requesting user.
- IDs are generated using `array.length + 1`.

---

## Response format

Every response follows this structure:

Success:
```json
{ "success": true, "data": {}, "error": null }
```

Error:
```json
{ "success": false, "data": null, "error": { "code": "...", "message": "...", "details": {} } }
```

---

## Error codes

| Code | Status | When |
|------|--------|------|
| `VALIDATION_ERROR` | 400 | missing required fields or invalid id |
| `UNAUTHORIZED` | 401 | wrong email or password |
| `FORBIDDEN` | 403 | role not allowed for this action |
| `NOT_FOUND` | 404 | id does not exist |
| `INTERNAL_SERVER_ERROR` | 500 | unexpected server error |

---

## API Reference

### Users — Auth

No authentication required.

| Method | Path | Body |
|--------|------|------|
| POST | /api/users/register | `{ firstName, lastName, email, password }` |
| POST | /api/users/login | `{ email, password }` |

**POST /api/users/register**

Request body:
```json
{ "firstName": "dana", "lastName": "levi", "email": "dana@example.com", "password": "1234" }
```

Success (201):
```json
{ "success": true, "data": { "userId": 5 }, "error": null }
```

Email already taken (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "this email is already registered", "details": {} } }
```

**POST /api/users/login**

Request body:
```json
{ "email": "michal@example.com", "password": "1234" }
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

### Users — Management

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/users | get all users | admin |
| GET | /api/users/:id | get one user | open |
| POST | /api/users | create a new user | admin |
| PUT | /api/users/:id | update user | admin, manager |
| DELETE | /api/users/:id | delete user | admin deletes anyone, user deletes themselves |

**POST /api/users**

Request body:
```json
{ "firstName": "yael", "lastName": "cohen", "userRole": "user" }
```

Success (201):
```json
{ "success": true, "data": { "userId": 5 }, "error": null }
```

**PUT /api/users/:id**

Request body (send only the fields you want to update):
```json
{ "firstName": "updated", "userRole": "manager" }
```

Success (200):
```json
{ "success": true, "data": { "userId": 4 }, "error": null }
```

**DELETE /api/users/:id**

Headers for admin:
```
x-user-role: admin
```

Headers for user deleting themselves:
```
x-user-role: user
x-user-id: 4
```

Success (200):
```json
{ "success": true, "data": { "userId": 4 }, "error": null }
```

Not found (404):
```json
{ "success": false, "data": null, "error": { "code": "NOT_FOUND", "message": "user 99 not found", "details": {} } }
```

Invalid id (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "id must be a number", "details": {} } }
```

---

### Attractions

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/attractions | get all attractions | open |
| GET | /api/attractions/map | get map pins for a city | open |
| GET | /api/attractions/:id | get one attraction | open |
| POST | /api/attractions | create attraction | admin |
| PUT | /api/attractions/:id | update attraction | admin, manager |
| DELETE | /api/attractions/:id | delete attraction | admin |

Query params for GET /api/attractions:
- `?type=site` — filter by type (site / tour / route)
- `?city_id=2` — filter by city

Query param for GET /api/attractions/map:
- `?city_id=2` — required

**POST /api/attractions** — required fields: `city_id`, `name`, `name_he`, `type`, `description_he`

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
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "please fill in all fields", "details": {} } }
```

Invalid type (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "type must be one of: site, tour, route", "details": { "field": "type" } } }
```

No permission (403):
```json
{ "success": false, "data": null, "error": { "code": "FORBIDDEN", "message": "You do not have permission to perform this action.", "details": {} } }
```

---

### Cities

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/cities | get all cities |
| GET | /api/cities/search | search by name |
| GET | /api/cities/:id | get one city |

Query param for search: `?q=buenos` — works in English and Hebrew.

Search success (200):
```json
{ "success": true, "data": [{ "id": 2, "name": "Buenos Aires", "name_he": "בואנוס איירס" }], "error": null }
```

Missing query (400):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "search query is required", "details": {} } }
```

Not found (404):
```json
{ "success": false, "data": null, "error": { "code": "NOT_FOUND", "message": "city 99 not found", "details": {} } }
```

---

### Favorites

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/favorites | get favorites for a user |
| POST | /api/favorites | add item to favorites |
| DELETE | /api/favorites/:id | remove item from favorites |

Query param for GET: `?userId=1` — required.

**POST /api/favorites**

Request body:
```json
{ "userId": 1, "itemId": 3, "itemType": "attraction" }
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

If a profile already exists for the user it gets updated, otherwise a new one is created.

Request body:
```json
{ "userId": 1, "travelerType": "couple", "interests": ["history", "food"], "budgetLevel": "medium" }
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

**logger** — runs on every request and logs method, path, status code and duration to the console.

Example:
```
[2026-05-02T14:48:15.000Z] method:GET path:/api/attractions status:200 duration:5ms
```

**roleCheck** — checks the `x-user-role` header on protected routes. Returns 403 if the role is not allowed.

**checkFields** — validates required fields in request body before reaching the controller. Returns 400 if any field is missing.

**errorHandler** — catches any unexpected error from controllers and returns 500.

To test protected routes in Postman, add this header:
```
x-user-role: admin
```

---

## Map feature

Based on feedback on the project spec, we added basic map support.

Each attraction includes `latitude` and `longitude` fields. We added a dedicated endpoint that returns only the fields needed to display map pins:

```
GET /api/attractions/map?city_id=2
```

Success:
```json
{ "success": true, "data": [ { "id": 1, "name_he": "לה בוקה", "type": "site", "latitude": -34.6345, "longitude": -58.3631 } ], "error": null }
```

In the next stage this data will connect to the frontend map component (e.g. Leaflet.js or Google Maps).
