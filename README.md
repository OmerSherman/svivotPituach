# Shvil HaTahina (שביל הטחינה)

Omer Sherman, Hillel Zilberman, Michal Adam  
Course: Web Development Environments · Ben-Gurion University

Shvil HaTahina is a full-stack travel-planning app for backpackers heading to South America.
The frontend is a React SPA; the backend is Express with MySQL (Prisma ORM), Socket.IO for
real-time chat, and Groq for AI-assisted trip planning.

---

## Project purpose

Shvil HaTahina ("the tahini trail") is a travel-planning web app for backpackers heading to South
America. It lets a user:

- Browse countries, cities and attractions (Peru, Argentina, Brazil, Colombia — 4 countries,
  6 cities, 20 attractions seeded out of the box).
- Create personal **trips** (destination country, date range, travel style, budget, interests) and
  favorite specific attractions inside a trip.
- See a **personalized score** per attraction (popularity, audience fit, and — when enough trip
  context is supplied — a "why this score" breakdown) instead of a flat list.
- Chat live with other travelers in a **per-country/per-city forum** (Socket.IO), and see who's
  currently online in each room.
- Plan a trip **with an AI assistant** (Groq/Llama) through a guided chat that proposes a structured
  trip draft, plus get a one-shot AI-written Hebrew summary of an existing trip.
- (admin/manager) Manage users and attractions through an admin portal.

It's a full-stack app: a React SPA talking to an Express REST + Socket.IO API backed by MySQL.

```
React SPA (localhost:5173)  ──REST + WebSocket──>  Express API (localhost:3000)  ──Prisma──>  MySQL (mydb)
                                                            │
                                                            └──>  Groq API (AI trip chat / summary)
```

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router 7, Leaflet/react-leaflet, socket.io-client (Create React App) |
| Backend | Express 5, Socket.IO 4 |
| Database | MySQL 8 |
| ORM | Prisma 6 |
| AI | Groq SDK (Llama models) |

---

## Installation instructions

**Prerequisites:** Node.js 18+, MySQL 8.0+ running (locally or reachable over the network), npm.

```bash
git clone <repo-url>
cd svivotPituach

# 1. Backend
cd backend
npm install
cp .env.example .env      # fill in DB_PASSWORD and GROQ_API_KEY — see "Environment variables" below
npm run db:setup           # first time only: creates tables via Prisma + seeds from backend/src/seed/
npm start                  # → http://localhost:3000

# 2. Frontend (separate terminal)
cd frontend
npm install
npm start                  # → http://localhost:5173
```

**Start the backend first** — the frontend expects it on port 3000 immediately (REST calls and the
Socket.IO connection both fail silently/log errors otherwise, they don't crash the page).

**Daily use after the first setup:** just `npm start` in both `backend/` and `frontend/`. You only
need to re-run `npm run db:setup` if you want to wipe and reseed the database, or after editing
`backend/models/schema.prisma`.

**Test users** (password for all: `123456`):

| Email | Role |
|-------|------|
| michal@example.com | admin |
| user@example.com | user |
| hillel@example.com | manager |

**Postman collection:** import `backend/docs/postman_collection.json` into Postman to exercise the
REST API directly (all test passwords: `123456`). Protected routes need these headers:
```
x-user-id: 1
x-user-role: admin
```

---

## Database setup

All data is stored in **MySQL**, in a database named `mydb` by default. If it doesn't exist yet,
create it once:

```sql
CREATE DATABASE IF NOT EXISTS mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

| Table | Purpose |
|-------|---------|
| `user` | Accounts (`user` / `manager` / `admin` roles) |
| `country` | Countries — Hebrew summary, banner image, lat/lng (used by the forum map) |
| `city` | Cities — Hebrew summary, banner image, lat/lng |
| `attraction` | POIs — image URL, tags, scores, best/avoid months, coordinates |
| `trip` | A user's saved trip ("profile" in the routes/code — see Known limitations) |
| `trip_attraction` | Junction table: trip ↔ attraction favorites (M:N, cascade delete) |
| `settings` | UI preferences per user (1:1 with `user`) |
| `message` | Forum chat messages, persisted across restarts |

**Setup / maintenance commands** (run from `backend/`):

| Command | What it does |
|---------|--------------|
| `npm run db:setup` | `prisma db push --force-reset` (drops + recreates all tables) then seeds from `src/seed/*.json`. Use on first install, after editing `models/schema.prisma`, or for a full reset. **Deletes all existing data.** |
| `npm run db:seed` | Pushes the schema without `--force-reset` and seeds only if the `city` table is empty — safe against a DB that already has data. |
| `npm run db:studio` | Opens Prisma Studio in the browser to view/edit rows without resetting. |
| `npm run db:generate` | Regenerates the Prisma client after changing `models/schema.prisma`. |

Seed data lives in `backend/src/seed/*.json` and is loaded by the setup script above.
The live schema is `backend/models/schema.prisma`, applied via `prisma db push`.
SQL files under `backend/migrations/` document the table structure.

---

## Environment variables

### Backend — `backend/.env` (copy from `backend/.env.example`)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=mydb
DATABASE_URL="mysql://root:your_mysql_password_here@localhost:3306/mydb"

GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

| Variable | Required | Notes |
|----------|----------|-------|
| `PORT` | no (default 3000) | Express listen port. |
| `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` | yes | Used for logging and to build `DATABASE_URL`; Prisma only actually reads `DATABASE_URL`. |
| `DATABASE_URL` | **yes** | The connection string Prisma/`mysql2` use — keep it in sync with the `DB_*` values. |
| `GROQ_API_KEY` | only for AI features | Without it, the AI trip-chat and `/api/ai/trip-summary` return `AI_UNAVAILABLE` (503) — everything else still works. |
| `GROQ_MODEL` | no | e.g. `llama-3.1-8b-instant` or `llama-3.3-70b-versatile`. |

`backend/.env` is gitignored — never committed.

### Frontend — `frontend/.env`

```env
PORT=5173
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
```

Copy from `frontend/.env.example` if the file is missing.

## ORM setup

The backend uses **Prisma** as its ORM over MySQL.

- Schema file: `backend/models/schema.prisma` — defines `User`, `Country`, `City`, `Attraction`,
  `Trip`, `TripAttraction`, `Settings`, `Message`, each `@@map`-ed onto the snake_case table names
  above.
- Because the schema lives in `backend/models/` instead of Prisma's default `prisma/` folder, every
  Prisma CLI command in `backend/package.json` passes `--schema=models/schema.prisma` explicitly.
- Runtime access goes through one shared Prisma client (`backend/src/db.js`, exporting `db.prisma`),
  consumed by a thin repository layer under `backend/src/repositories/*.js` (`userRepo`, `tripRepo`,
  `attractionRepo`, `cityRepo`, `countryRepo`, `favoriteRepo`, `messageRepo`, `settingsRepo`).
  Controllers never import Prisma or write SQL directly — they always go through a repository.
- After editing `schema.prisma`: `npm run db:generate` (regenerate client) then `npm run db:setup`
  (or `db:seed` to avoid wiping data) to apply the change to MySQL.

---

## Response format

Every endpoint returns this envelope:

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

| Code | Status | When |
|------|--------|------|
| `VALIDATION_ERROR` | 400 | Missing fields or invalid input |
| `UNAUTHORIZED` | 401 | Missing/invalid `x-user-id` |
| `FORBIDDEN` | 403 | Role not allowed, or acting on another user's resource |
| `NOT_FOUND` | 404 | Resource does not exist |
| `AI_UNAVAILABLE` | 503 | Groq API unavailable (missing key, network, rate limit) |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error (caught by `errorHandler`) |

---

## API endpoints

All routes are mounted under `/api` in `backend/src/app.js`. Auth is **not** session/JWT-based — the
client sends `x-user-id` and `x-user-role` as plain headers, and the server trusts them as-is (see
Known limitations).

### Auth — `/api/auth` (open to everyone)

| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/register` | `{ firstName, lastName, email, password }` | |
| POST | `/login` | `{ email, password }` | |
| POST | `/logout` | — | No server-side session exists yet; always returns ok. |

**POST /api/auth/login** — success (200):
```json
{ "success": true, "data": { "userId": 1, "firstName": "michal", "userRole": "admin" }, "error": null }
```

### Users — `/api/users`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/me` | `x-user-id` | Returns the caller's own safe profile fields. |
| PUT | `/me` | `x-user-id` | Updates own `firstName`/`lastName`/`email`. |
| GET | `/` | admin | Returns full user rows, **including the plaintext `password` field** — see Known limitations. |
| GET | `/:id` | open, no header required at all | Same as above: returns the raw row including `password`. Only `GET /me` strips it. |
| POST | `/` | admin | Required: `firstName`, `lastName`, `userRole`. |
| PUT | `/:id` | admin, manager | A `manager` caller may only change `userRole`; `admin` may change `firstName`/`lastName`/`userRole`. |
| DELETE | `/:id` | admin, or self | Self-delete checked against `x-user-id`/`x-user-role` headers in the controller — not via `roleCheck`. |

### Cities — `/api/cities` (open)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | All cities (with `banner_image_url`, `summary_he`) |
| GET | `/search?q=` | Search by English or Hebrew name |
| GET | `/:id` | Single city |

### Countries — `/api/countries` (open)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | All countries (with `latitude`/`longitude`, used by the forum map) |
| GET | `/:id` | Single country |

### Attractions — `/api/attractions`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | open | Filters: `type`, `city_id`; plus personalization query params |
| GET | `/top?min_score=&limit=` | open | Top-scoring attractions (defaults: `min_score=80`, `limit=6`) |
| GET | `/map?city_id=` | open | Map pins for one city |
| GET | `/:id` | open | |
| POST | `/` | admin | Required: `city_id`, `name`, `name_he`, `type` (`site`\|`tour`\|`route`), `description_he` |
| PUT | `/:id` | admin, manager | |
| DELETE | `/:id` | admin | |

Personalization query params accepted by `GET /` and `GET /:id`: `travelStyle`, `startMonth`,
`endMonth`, `interests` (comma-separated). When enough of these are present, the response includes a
personalized score/reason breakdown in addition to the always-present popularity and audience scores
(see `backend/src/utils/attractionScoring.js`). Used by the Leaflet map in the forum and city pages
on the frontend (`GET /api/attractions/map?city_id=2` returns pins:
`{ id, name_he, type, latitude, longitude }`).

### Trips ("Profile") — `/api/profile`

Requires `x-user-id` header on every route. A trip can only be read/modified by the user who owns it
(`403 FORBIDDEN` otherwise).

| Method | Path | Description |
|--------|------|--------------|
| GET | `/` | My trips |
| GET | `/:id` | Single trip |
| POST | `/` | Create trip. Required: `name`, `countryId`, `startMonth`, `endMonth`, `travelerType`, `budgetLevel`. Optional: `interests` (array). |
| PUT | `/:id` | Partial update (any of the create fields) |
| DELETE | `/:id` | Delete trip (cascades to its `trip_attraction` rows) |
| POST | `/:id/favorites` | Toggle a favorite — body `{ attractionId }` |

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

> Note: this resource is called "profile" in the routes/controllers for historical reasons, but it
> represents a saved **trip**, not an account profile (see Known limitations).

### Settings — `/api/settings`

Requires `x-user-id`. Despite the name, this resource covers both display preferences **and**
a few editable account fields, and the response always returns both together.

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/` | — | `{ firstName, lastName, email, theme, fontSize, density }` |
| PUT | `/` | Any subset of `{ firstName, lastName, email, theme, fontSize, density }` | Same shape as GET, after applying the update |

Valid values: `theme` ∈ `light`\|`dark`, `fontSize` ∈ `small`\|`medium`\|`large`, `density` ∈
`compact`\|`normal`\|`spacious` — an invalid value for any of the three is a `400 VALIDATION_ERROR`.
`firstName`/`lastName`/`email` are written straight to the `user` table with no extra validation.

### Favorites — `/api/favorites`

A second API surface over the same `trip_attraction` junction table as `/api/profile/:id/favorites`
(see Known limitations).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/?userId=` | All favorites across the user's trips |
| POST | `/` | Add — required body: `userId`, `tripId`, `itemId`, `itemType: "attraction"` |
| DELETE | `/:id` | Remove — `id` format is `tripId-attractionId` (e.g. `1-3`) |

### Forum — `/api/forum`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:room/messages` | Last 50 messages for a room (e.g. `country_1`, `city_3`), read from MySQL |

Live messaging itself goes over Socket.IO, not REST — see WebSocket feature below.

### AI — `/api/ai`

Requires `x-user-id` and a working `GROQ_API_KEY`.

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/trip-summary` | `{ tripId }` | One-shot Hebrew text summary of a trip the caller owns (503 `AI_UNAVAILABLE` if Groq fails) |

### Middleware

| Middleware | Purpose |
|------------|---------|
| `logger` | Logs method, path, status, duration for every request |
| `roleCheck(...roles)` | Reads `x-user-role`; 403s if missing or not in the allowed list |
| `checkFields([...])` | 400s with `{ missFields: [...] }` if any required body field is missing/falsy |
| `errorHandler` | Last-resort handler registered after all routes; turns uncaught errors into a `500 INTERNAL_SERVER_ERROR` envelope |

---

## WebSocket feature

Both real-time features share **one** Socket.IO server attached to the same HTTP server as the
REST API: `http://localhost:3000`. There's no separate port or namespace — `backend/src/app.js`
creates one `io` instance and registers two independent socket modules on it.

### Forum chat — `backend/src/socket/forum_socket.js`

Lets users in the same country/city room see each other's messages live, with a presence counter.

| Client → Server | Payload | Effect |
|------------------|---------|--------|
| `room:join` | `{ room }` | Joins a Socket.IO room (e.g. `country_1`, `city_3`); emits updated presence to the room |
| `room:leave` | `{ room }` | Leaves without disconnecting; emits updated presence |
| `message:send` | `{ room, userId, userName, text }` | Persists the message via `messageRepo.create` (MySQL `message` table), then broadcasts it |

| Server → Client | Payload | When |
|------------------|---------|------|
| `message:new` | Saved message object | Broadcast to everyone else in the room (the sender adds its own message optimistically and does not receive this event for its own send) |
| `presence:update` | `{ room, count }` | On join, leave, and disconnect |
| `message:error` | `{ message }` | If saving the message fails |

No auth handshake is required to join the forum socket — any connected client can join/leave rooms
and send messages with whatever `userId`/`userName` it provides. Rooms are named `country_<id>` /
`city_<id>`, built dynamically on the frontend from `GET /api/countries` and `GET /api/cities`
(`frontend/src/pages/Forum.js`) — not a hardcoded list. Message history loads over REST first
(`GET /api/forum/:room/messages`, last 50), then live updates arrive over the socket.

### AI trip chat — `backend/src/socket/aiTripSocket.js`

Connect with `auth: { userId }` in the Socket.IO handshake (this is separate from the REST
`x-user-id` header). Without a valid positive integer `userId`, `ai-trip:start` replies with
`ai-trip:error` and refuses to start a session.

| Client → Server | Description |
|------------------|-------------|
| `ai-trip:start` | Starts a new guided conversation (sends an opening prompt to Groq) |
| `ai-trip:user-message` | `{ text }` — one turn of the conversation |
| `ai-trip:reset` | Drops the current session and starts a fresh one |

| Server → Client | Payload | Description |
|------------------|---------|--------------|
| `ai-trip:bot-message` | `{ text, draft }` | The assistant's reply plus its current (possibly incomplete) trip draft |
| `ai-trip:bot-typing` | `{ typing }` | Shown while waiting on Groq |
| `ai-trip:draft-ready` | `{ draft }` | Emitted once the draft passes `utils/validateTripDraft.js` |
| `ai-trip:error` | `{ message }` | Includes a Hebrew "AI unavailable" message specifically when Groq itself fails |

Sessions are kept in an in-memory `Map` keyed by socket id and swept every 5 minutes; a session idle
for more than 30 minutes is dropped and its socket disconnected (see Known limitations — sessions do
not survive a server restart and are not shared across server instances).

---

## AI feature

`backend/src/services/groqService.js` wraps **Groq**'s hosted Llama models (`groq-sdk`) and powers
two things:

1. **Guided trip-planning chat** (the `ai-trip:*` socket events above) — the assistant asks
   questions, accumulates a structured draft (`name`, `countryId`, `startMonth`/`endMonth`,
   `travelStyle` ∈ `solo`\|`couple`\|`family`\|`group`, `budget` ∈ `low`\|`medium`\|`high`,
   `interests`), and signals `draft-ready` once `utils/validateTripDraft.js` accepts it.
   `validateTripDraft.js` requires both months 1–12, a real `countryId`, and silently drops any
   `interests` tag not in the fixed Hebrew whitelist (תרבות, היסטוריה, טבע, נוף, אוכל, אמנות,
   אדריכלות, חוף, הליכה, צילום, חיי לילה, קניות). The frontend (`AiTripChatModal`) lets the user
   confirm or edit the draft and save it via `POST /api/profile`.
2. **One-shot trip summary** (`POST /api/ai/trip-summary`) — given a `tripId` the caller owns, builds
   a context object (country name, date range, travel style, budget, interests, favorited attraction
   names) and asks Groq for a short Hebrew narrative summary, shown on `TripDetail.jsx`.

System prompts live in `backend/src/prompts/tripChatSystemPrompt.js` and
`backend/src/prompts/tripSummaryPrompt.js`. Any Groq-side failure (missing `GROQ_API_KEY`, network
error, rate limit) is normalized by `groqService.js` into an `err.aiUnavailable` flag, which
controllers/sockets turn into a friendly Hebrew "AI unavailable" message (REST:
`503 AI_UNAVAILABLE`; socket: `ai-trip:error`) instead of a raw 500 — every other feature in the app
keeps working without a Groq key.

---

## Frontend overview

Create React App, React 19, React Router 7, no UI library (handwritten components + CSS variables
for theme/density). RTL Hebrew UI throughout.

| Route | Page | Notes |
|-------|------|-------|
| `/login` | `Login.jsx` | Public — login + register forms |
| `/` | `Home.jsx` | Dashboard: cities, top attractions, "my trips" section, AI trip planner entry point |
| `/trips/:id` | `TripDetail.jsx` | Trip details, personalized attractions, favorites, AI summary |
| `/cities/:id` | `CityAttractions.jsx` | Attractions for one city + CRUD for admin/manager |
| `/settings` | `Settings.jsx` | Edit name/email + theme/fontSize/density; delete account |
| `/forum` | `Forum.js` | Country/city room list + map + live chat |
| `/adminPortal` | `adminPortal.jsx` | User list/search (admin, manager) |
| `/adminPortaluser` | `adminPortaluser.jsx` | Edit a single user, role-gated by `ROLE_LEVELS` |

All other routes are wrapped in `ProtectedRoute` (redirects to `/login` if no user in context).
Every API call goes through `frontend/src/services/*.js`, which funnel through `services/api.js` —
no component calls `fetch` directly.

State is React Context + `localStorage`, no Redux: `userContext` (`"user"` key) and
`preferencesContext` (`"preferences"` key) both hydrate from `localStorage` on load so a refresh
keeps you logged in and keeps your theme without a server round-trip.

---

## Known limitations

- **No real authentication.** There is no session/JWT — the client sends `x-user-id`/`x-user-role`
  as plain headers, and the server trusts them as-is.
- **Passwords are stored in plaintext** in the `user` table.
- **The login flow exposes the plaintext password over the network.** `Login.jsx` calls
  `GET /api/users/:id` right after login to fetch the full profile — that endpoint returns the raw
  DB row (`userRepo.findById`), which still has the `password` field, and that route has **no auth
  check at all**. The password briefly lands in the browser's Network tab and in React state before
  `Navbar.jsx`'s `GET /api/users/me` call (which *does* strip it) overwrites it a moment later. Don't
  assume any response other than `/me` ever hides the password.
- **Password strength (6+ chars) is only enforced client-side** (`Login.jsx`); the backend's
  `checkFields` middleware only checks that `password` is present, not its length.
- **Two overlapping favorites APIs.** `POST /api/profile/:id/favorites` and `/api/favorites`
  both read/write the same `trip_attraction` table through different controller shapes.
- **"Profile" means "trip".** `/api/profile` manages saved trips; account data is under `/api/users/me`.
- **AI chat sessions are in-memory only** — lost on server restart.
- **No automated tests.** Backend `npm test` is a placeholder.
- **CORS is hardcoded** to `http://localhost:5173` in `backend/src/app.js`.
- **AI requires Groq.** Without a valid `GROQ_API_KEY`, trip-chat and trip-summary return
  `AI_UNAVAILABLE`; all other features work normally.

---

## Additional files

| File | Description |
|------|-------------|
| `backend/docs/postman_collection.json` | Postman collection for the REST API |
| `backend/docs/screenshots/` | Demo video and screenshot evidence |
| `backend/.env.example` | Backend environment template |
| `frontend/.env.example` | Frontend environment template |
