# Shvil HaTahina — Backend API

**Assignment 4** | Omer Sherman, Hillel Zilberman, Michal Adam  
Course: Web Environments · Ben-Gurion University

---

## How to install and run

```bash
cd Server
npm install
cp .env.example .env   # fill DB_PASSWORD and GROQ_API_KEY
npm run db:generate
npm run db:build       # from project root: node Server/scripts/build-db.js
npm start
```

Server: `http://localhost:3000`  
API base: `/api`

---

## Database

All data is stored in **MySQL** (`mydb`). Runtime access uses **Prisma** via `Server/repositories/`.

| Table | Purpose |
|-------|---------|
| `user` | Accounts (user / manager / admin) |
| `country` | Countries with summary + banner image |
| `city` | Cities with summary + banner image |
| `attraction` | POIs with image URL, tags, scores, coordinates |
| `trip` | User travel profiles |
| `trip_attraction` | Junction: trip ↔ attraction favorites (M:N) |
| `settings` | UI preferences per user (1:1) |
| `message` | Forum chat messages |

**Build / reset DB:**
```bash
npm run db:build      # full import + enrichment
npm run db:enrich     # fill missing images/descriptions only
npm run db:studio     # Prisma UI
```

---

## Assumptions

- Authentication uses headers `x-user-id` and `x-user-role` after login (no JWT).
- Login: `POST /api/auth/login` → client stores `{ userId, firstName, userRole }` in localStorage.
- Protected routes expect both headers where noted.
- Passwords are stored in plaintext (course project only).
- AI features require `GROQ_API_KEY` in `Server/.env`.

**Test users** (password for all: `123456`):

| Email | Role |
|-------|------|
| michal@example.com | admin |
| user@example.com | user |
| hillel@example.com | manager |

---

## Response format

Every response follows this structure:

**Success:**
```json
{ "success": true, "data": {}, "error": null }
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} }
}
```

---

## Error codes

| Code | Status | When |
|------|--------|------|
| `VALIDATION_ERROR` | 400 | Missing fields or invalid input |
| `UNAUTHORIZED` | 401 | Not logged in / wrong credentials |
| `FORBIDDEN` | 403 | Role not allowed |
| `NOT_FOUND` | 404 | Resource does not exist |
| `AI_UNAVAILABLE` | 503 | Groq API unavailable |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## API Reference

### Auth — `/api/auth`

No authentication required.

| Method | Path | Body |
|--------|------|------|
| POST | `/register` | `{ firstName, lastName, email, password }` |
| POST | `/login` | `{ email, password }` |
| POST | `/logout` | — |

**POST /api/auth/login** — success (200):
```json
{ "success": true, "data": { "userId": 1, "firstName": "michal", "userRole": "admin" }, "error": null }
```

---

### Users — `/api/users`

| Method | Path | Auth |
|--------|------|------|
| GET | `/me` | `x-user-id` |
| PUT | `/me` | `x-user-id` |
| GET | `/` | admin |
| GET | `/:id` | open |
| POST | `/` | admin |
| PUT | `/:id` | admin, manager |
| DELETE | `/:id` | admin or self |

---

### Cities — `/api/cities`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | All cities (with `banner_image_url`, `summary_he`) |
| GET | `/search?q=` | Search by English or Hebrew name |
| GET | `/:id` | Single city |

---

### Attractions — `/api/attractions`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | open — filters: `type`, `city_id`, personalization params |
| GET | `/map?city_id=` | open |
| GET | `/:id` | open |
| POST | `/` | admin |
| PUT | `/:id` | admin, manager |
| DELETE | `/:id` | admin |

Personalization query params for GET `/`:
- `travelStyle`, `startMonth`, `endMonth`, `interests` (comma-separated)

**POST /api/attractions** — required: `city_id`, `name`, `name_he`, `type`, `description_he`  
Optional: `image_url`, `tags`, `latitude`, `longitude`, `best_months`, `avoid_months`

---

### Trips (Profile) — `/api/profile`

Requires `x-user-id` header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | My trips |
| POST | `/` | Create trip |
| GET | `/:id` | Single trip with favorites |
| PUT | `/:id` | Update trip |
| DELETE | `/:id` | Delete trip |
| POST | `/:id/favorites` | Toggle favorite `{ attractionId }` |

**POST /api/profile** — required: `name`, `countryId`, `startMonth`, `endMonth`, `travelerType`, `budgetLevel`  
Optional: `interests` (array)

```json
{
  "name": "טיול לפרו",
  "countryId": 1,
  "startMonth": 3,
  "endMonth": 5,
  "travelerType": "solo",
  "budgetLevel": "medium",
  "interests": ["תרבות", "טבע"]
}
```

---

### Settings — `/api/settings`

Requires `x-user-id`.

| Method | Path | Body |
|--------|------|------|
| GET | `/` | — |
| PUT | `/` | `{ theme, fontSize, density }` |

---

### Favorites — `/api/favorites`

Stored in `trip_attraction` junction table.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/?userId=` | All favorites across user's trips |
| POST | `/` | Add — requires `userId`, `tripId`, `itemId`, `itemType: "attraction"` |
| DELETE | `/:id` | Remove — id format: `tripId-attractionId` (e.g. `1-3`) |

---

### Forum — `/api/forum`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:room/messages` | Last 50 messages (e.g. `country_1`, `city_3`) |

Real-time chat uses **Socket.IO** (see WebSockets below).

---

### AI — `/api/ai`

Requires `x-user-id` and `GROQ_API_KEY`.

| Method | Path | Body |
|--------|------|------|
| POST | `/trip-summary` | `{ tripId }` |

Returns Hebrew trip summary generated by Groq (Llama).

---

## WebSockets

Connection URL: `http://localhost:3000` (same as REST server)

### Forum — `forum_socket.js`

| Client → Server | Payload |
|-----------------|---------|
| `room:join` | `{ room }` |
| `room:leave` | `{ room }` |
| `message:send` | `{ room, userId, userName, text }` |

| Server → Client | Payload |
|-----------------|---------|
| `message:new` | Saved message object |
| `presence:update` | `{ room, count }` |
| `message:error` | `{ message }` |

### AI Trip Chat — `aiTripSocket.js`

Connect with `auth: { userId }`.

| Client → Server | Description |
|-----------------|-------------|
| `ai-trip:start` | Start conversation |
| `ai-trip:user-message` | `{ text }` |
| `ai-trip:reset` | Reset session |

| Server → Client | Description |
|-----------------|-------------|
| `ai-trip:bot-message` | `{ text, draft }` |
| `ai-trip:bot-typing` | `{ typing }` |
| `ai-trip:draft-ready` | `{ draft }` |
| `ai-trip:error` | `{ message }` |

---

## Middleware

| Middleware | Purpose |
|------------|---------|
| `logger` | Logs method, path, status, duration |
| `roleCheck(...roles)` | Validates `x-user-role` — 403 if not allowed |
| `checkFields([...])` | Validates required body fields — 400 |
| `errorHandler` | Catches unhandled errors — 500 with standard format |

**Postman headers for protected routes:**
```
x-user-id: 1
x-user-role: admin
```

---

## Map feature

```
GET /api/attractions/map?city_id=2
```

Returns pins: `{ id, name_he, type, latitude, longitude }`

Used by Leaflet map in forum and city pages.

---

## Postman collection

Import `Server/docs/postman_collection.json` into Postman.  
All test passwords: `123456`.
