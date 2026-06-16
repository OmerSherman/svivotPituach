# שביל הטחינה (Shvil HaTahina)

A travel-planning app for backpackers heading to South America — Peru, Argentina, and Brazil.
You browse cities and attractions, build a personalized trip, mark favorites, and tweak how the
app looks. Built as a full-stack React + Express project.

**Course:** סביבות פיתוח באינטרנט · Ben-Gurion University of the Negev
**Team:** Omer Sherman · Hillel Zilberman · Michal Adam

---

## What it does

- Login and register, with three roles: user / manager / admin
- Browse cities and their top attractions across South America
- Build a custom trip: destination, dates, travel style, budget, and interests
- Mark favorite attractions per trip (with a "tahini jar" that fills up as you add more)
- Display preferences saved per user: light/dark theme, font size, card density
- Search for cities and attractions
- Admin tools: manage users and run CRUD on attractions

---

## How to run

You'll need **Node.js 18 or newer**. The app has two parts — a backend and a frontend —
and they run in **two separate terminals**. Start the backend first, because the frontend
expects it to already be up on port 3000.

### 1. Backend (start this first)

```bash
cd Server
npm install
npm start
```

The server starts on **http://localhost:3000**. You should see `Server running on http://localhost:3000`
in the terminal.

### 2. Frontend (in a second terminal)

```bash
cd client
npm install
npm start
```

The app opens in your browser at **http://localhost:5173**.

That's it — the frontend talks to the backend automatically.

### Ports and environment

Each part runs on its own port and ships with a ready `.env` file, so there's nothing to configure:

| Part      | Port | Config file    |
|-----------|------|----------------|
| Frontend  | 5173 | `client/.env`  |
| Backend   | 3000 | `Server/.env`  |

- The frontend runs at **http://localhost:5173**.
- The backend API base URL is **http://localhost:3000/api**, set in `client/.env` as
  `REACT_APP_API_URL`. If that variable is ever missing, the frontend falls back to the same URL anyway.

---

## Test users

Every user's password is `123456`.

| Email                   | Role    |
|-------------------------|---------|
| michal@example.com      | admin   |
| omersherman22@gmail.com | admin   |
| hillel@example.com      | manager |
| user@example.com        | user    |

---

## Project structure

```
svivotPituach/
├── Server/                  # Express REST API (Assignment 2)
│   ├── app.js               # entry point
│   ├── .env                 # backend port
│   ├── routes/              # one router per entity
│   ├── controllers/         # request handling and logic
│   ├── middleware/          # auth, validation, logging, error handling
│   └── models/
│       └── mock_data/       # JSON files used as the database
│
├── client/                  # React frontend (Assignment 3)
│   ├── .env                 # frontend port + API URL
│   └── src/
│       ├── App.js           # routing and context providers
│       ├── components/      # reusable: Navbar, Footer, ItemCard, DataTable, ...
│       ├── pages/           # routes: Home, Login, Settings, TripDetail, ...
│       ├── services/        # API communication layer
│       └── contexts/        # global state: user, preferences
│
├── screenshots/             # the app running (Login, Dashboard, Table, Settings)
└── README.md
```

---

## API endpoints

All responses follow the shape `{ success, data, error }`. Auth is passed through the
headers `x-user-id` and `x-user-role` (mock auth for now — we'll move to JWT later).

| Method | Path                          | Access          | Description                          |
|--------|-------------------------------|-----------------|--------------------------------------|
| POST   | /api/auth/register            | public          | create a new user                    |
| POST   | /api/auth/login               | public          | sign in                              |
| POST   | /api/auth/logout              | public          | sign out                             |
| GET    | /api/users/me                 | logged in       | current user info                    |
| GET    | /api/users                    | admin/manager   | list all users                       |
| PUT    | /api/users/:id                | admin/manager   | update a user                        |
| DELETE | /api/users/:id                | admin or self   | delete a user                        |
| GET    | /api/cities                   | logged in       | list all cities                      |
| GET    | /api/cities/search?q=         | logged in       | search cities by name                |
| GET    | /api/cities/:id               | logged in       | one city                             |
| GET    | /api/attractions              | logged in       | list attractions (filter by city/type) |
| GET    | /api/attractions/:id          | logged in       | one attraction                       |
| POST   | /api/attractions              | admin           | create an attraction                 |
| PUT    | /api/attractions/:id          | admin/manager   | update an attraction                 |
| DELETE | /api/attractions/:id          | admin           | delete an attraction                 |
| GET    | /api/profile                  | logged in       | current user's trips                 |
| POST   | /api/profile                  | logged in       | create a trip                        |
| GET    | /api/profile/:id              | owner           | one trip                             |
| PUT    | /api/profile/:id              | owner           | update a trip                        |
| DELETE | /api/profile/:id              | owner           | delete a trip                        |
| POST   | /api/profile/:id/favorites    | owner           | toggle a favorite attraction         |
| GET    | /api/settings                 | logged in       | user info + display preferences      |
| PUT    | /api/settings                 | logged in       | update info and/or preferences       |

---

## Tech stack

- **Frontend:** React 19, React Router 7, plain CSS with CSS variables
- **Backend:** Node.js + Express 5
- **Data:** mock JSON files (moving to MySQL in Assignment 4)
- No external UI libraries — the components are all handwritten.

---

## Notes

- The logged-in user and preferences are saved to localStorage, so a refresh keeps you signed in.
- Theme, font size, and card density are stored per user on the server and come back on login.
- Validation runs on the server for every POST and PUT request.
