# שביל הטחינה (Shvil HaTahina)

Travel guide application for South America — Peru, Argentina, Brazil.

**Course:** סביבות פיתוח באינטרנט · Ben-Gurion University
**Team:** Omer Sherman · Hillel Zilberman · Michal Adam

---

## Overview

A full-stack React + Express app that helps Israeli backpackers plan a South America trip.
Users can browse cities and attractions, create personalized trip profiles, mark favorites, and customize their display.

**Features:**
- 🔐 Login + register with role-based access (user / manager / admin)
- 🗺 Browse cities and top attractions from across South America
- ✈️ Create custom trips with destination, dates, style, budget, and interests
- ❤️ Mark favorite attractions per trip (with a gamified "tahini jar" that fills up)
- 🎨 Display preferences: theme (light/dark), font size, card density
- 🔍 Search cities and attractions
- 🛠 Admin tools: manage users (admin/manager), CRUD attractions (admin/manager)

---

## How to run

You need **Node.js 18+** installed.

### 1. Backend (run first)
```bash
cd Server
npm install
npm start
```
The server will start on **http://localhost:3000**.

### 2. Frontend (in a separate terminal)
```bash
cd client
npm install
npm start
```
The client will open at **http://localhost:5173**.

The client communicates with the backend at `http://localhost:3000/api`.

### Environment variables

Both folders contain a `.env` file with the default settings:
- `client/.env` → `PORT=5173` and `REACT_APP_API_URL=http://localhost:3000/api`
- `Server/.env` → `PORT=3000`

---

## Test users

All users have password `123456`:

| Email | Role |
|---|---|
| michal@example.com | admin |
| omersherman22@gmail.com | admin |
| hillel@example.com | manager |
| user@example.com | user |

---

## Project structure

```
svivotPituach/
├── Server/                       # Express REST API (Assignment 2)
│   ├── app.js                    # entry point
│   ├── routes/                   # Express routers per entity
│   ├── controllers/              # business logic per entity
│   ├── models/
│   │   └── mock_data/            # JSON files as the database
│   └── middleware/               # auth, validation, error handling
│
├── client/                       # React frontend (Assignment 3)
│   └── src/
│       ├── App.js                # routing + context providers
│       ├── components/           # reusable: Navbar, Footer, ItemCard, DataTable...
│       ├── pages/                # routes: Home, Login, Settings, TripDetail...
│       ├── services/             # API communication layer
│       └── contexts/             # global state: user, preferences
│
└── screenshots/                  # screenshots showing the app running
```

---

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | public | create a new user |
| POST | /api/auth/login | public | sign in |
| POST | /api/auth/logout | public | sign out |
| GET | /api/users/me | logged in | current user info |
| GET | /api/users | admin/manager | list all users |
| PUT | /api/users/:id | admin/manager | update user |
| DELETE | /api/users/:id | admin or self | delete user |
| GET | /api/cities | logged in | list all cities |
| GET | /api/cities/search?q= | logged in | search cities by name |
| GET | /api/cities/:id | logged in | one city |
| GET | /api/attractions | logged in | list attractions (filter by city_id, type) |
| GET | /api/attractions/:id | logged in | one attraction |
| POST | /api/attractions | admin | create attraction |
| PUT | /api/attractions/:id | admin/manager | update attraction |
| DELETE | /api/attractions/:id | admin | delete attraction |
| GET | /api/profile | logged in | list current user's trips |
| POST | /api/profile | logged in | create a trip |
| GET | /api/profile/:id | owner | one trip |
| PUT | /api/profile/:id | owner | update a trip |
| DELETE | /api/profile/:id | owner | delete a trip |
| POST | /api/profile/:id/favorites | owner | toggle favorite attraction |
| GET | /api/settings | logged in | user info + display preferences |
| PUT | /api/settings | logged in | update info and/or preferences |

Auth is via headers `x-user-id` and `x-user-role` (mock auth - to be replaced with JWT later).

---

## Tech stack

- **Frontend:** React 19, React Router 7, plain CSS with CSS variables
- **Backend:** Node.js + Express 5
- **Data:** mock JSON files (will move to MySQL in Assignment 4)
- **No external UI libraries** — all components handcrafted

---

## Notes

- The frontend persists the logged-in user and preferences to localStorage so refresh keeps the session.
- Theme (light/dark), font size, and card density are stored per-user on the server and synced across devices on login.
- All API responses follow the format `{ success, data, error }`.
- Server-side validation is enforced on all PUT/POST endpoints.
