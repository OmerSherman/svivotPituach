# שביל הטחינה — Frontend (Assignment 3)

React frontend connecting to the Assignment 2 backend.

**Team:** Omer Sherman, Hillel Zilberman, Michal Adam

---

## How to install and run

The backend (Assignment 2) must be running first.

### 1. Start the backend
```bash
cd Server
npm install
node app.js
```
The backend runs on **`http://localhost:3000`**.

### 2. Start the frontend (in a separate terminal)
```bash
cd client
npm install
npm start
```
The frontend runs on **`http://localhost:3001`** (configured in `.env`).
The browser should open automatically — if not, navigate to `http://localhost:3001`.

> **Note:** The backend's CORS is configured to accept requests from
> `http://localhost:3001`, so the frontend must run on port 3001.

---

## Configuration

`.env` (already included in the project):
```
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
```

**API Base URL:** `http://localhost:3000`

---

## Test accounts

The backend ships with four mock users (all have password `1234`):

| Email                | Role    |
|----------------------|---------|
| michal@example.com   | admin   |
| omer@example.com     | admin   |
| hillel@example.com   | manager |
| user@example.com     | user    |

---

## Project structure

Follows the structure required by the assignment:

```
client/src/
├── App.js                    Main entry & routing
├── components/               Reusable UI elements
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Layout.jsx
│   ├── ItemCard.jsx          Reusable card  (used 3+ times)
│   ├── DataTable.jsx         Reusable table (required)
│   └── attraction_card.jsx
├── pages/                    Route views
│   ├── Login.jsx
│   ├── Home.jsx              Dashboard
│   ├── Settings.jsx
│   └── CityAttractions.jsx
└── services/                 API communication
    ├── api.js
    ├── authService.js
    ├── usersService.js
    ├── attractionsService.js
    ├── citiesService.js
    └── settingsService.js
```

---

## How requirements map to the code

| # | Requirement                          | Files                                         |
|---|--------------------------------------|-----------------------------------------------|
| 1 | Login Page                           | `pages/Login.jsx`                             |
| 2 | Navbar & Layout                      | `components/Navbar.jsx`, `components/Layout.jsx` |
| 3 | Footer                               | `components/Footer.jsx`                       |
| 4 | Settings Page                        | `pages/Settings.jsx` + `services/settingsService.js` |
| 5 | Dashboard / Home                     | `pages/Home.jsx`                              |
| 6 | Reusable Card (used 3+ times)        | `components/ItemCard.jsx` — used in Home (cities), Home (top attractions), and CityAttractions |
| 7 | Data Table                           | `components/DataTable.jsx` — used in `CityAttractions.jsx` |

---

## Routes

| Path                | Page              | Notes                            |
|---------------------|-------------------|----------------------------------|
| `/login`            | Login             | Public                           |
| `/register`         | Register          | Public                           |
| `/`                 | Home / Dashboard  | Requires login                   |
| `/settings`         | Settings          | Requires login                   |
| `/cities/:id`       | CityAttractions   | DataTable + Card grid for a city |

---

## Backend endpoints used

| Method | Path                        | Used by                  |
|--------|-----------------------------|--------------------------|
| POST   | `/api/auth/login`           | Login                    |
| POST   | `/api/auth/logout`          | Navbar logout            |
| POST   | `/api/users/register`       | Register                 |
| GET    | `/api/users/me`             | Navbar / current user    |
| GET    | `/api/settings`             | Settings load            |
| PUT    | `/api/settings`             | Settings save            |
| GET    | `/api/cities`               | Home                     |
| GET    | `/api/cities/:id`           | CityAttractions          |
| GET    | `/api/attractions`          | Home                     |
| GET    | `/api/attractions?city_id=` | CityAttractions          |

The `/auth/*`, `/users/me` and `/settings` endpoints were added in this assignment.

---

## Authentication (mock)

The backend has no JWT yet (planned for the next assignment). For now, the
app simulates auth via two HTTP headers, set automatically by
`services/api.js` based on what's stored in `localStorage`:

- `x-user-role` — one of `admin`, `manager`, `user`
- `x-user-id`   — the user's id (used by routes like `/users/me` and `/settings`)

After a successful login, the user object is stored in `localStorage` under
the key `user`. Logout clears it.
