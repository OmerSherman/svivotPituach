# Shvil HaTahina - Client

React frontend for Assignment 3 — connects to the backend REST API from Assignment 2.

**Team:** Omer Sherman · Hillel Zilberman · Michal Adam

---

## How to install dependencies

```bash
npm install
```

## How to start

```bash
npm start
```

The app will open automatically at **http://localhost:5173**.

## API Base URL

The frontend runs at **http://localhost:5173** and connects to the backend API at **http://localhost:3000/api**.

⚠️ Make sure the backend server is running first (`cd ../Server && npm start`).

---

## Test users

All users have password `123456`:
- michal@example.com (admin)
- omersherman22@gmail.com (admin)
- hillel@example.com (manager)
- user@example.com (user)

---

## Project structure

```
src/
  App.js                    # main entry + routing + global providers
  index.js                  # bootstrap
  index.css                 # CSS variables (theme/font/density)
  components/               # reusable UI elements
    Navbar.jsx              # top navigation (logo, links, user, logout)
    Footer.jsx              # site footer
    Layout.jsx              # wraps every page (Navbar + content + Footer)
    Form.jsx                # generic form component (used by Login + Register)
    ItemCard.jsx            # reusable card (used 3+ times for cities, attractions, etc)
    DataTable.jsx           # reusable data table component
    SearchBar.jsx           # reusable search input
    TripForm.jsx            # modal to create/edit a trip
    AttractionForm.jsx      # modal to create/edit an attraction (admin)
    AttractionModal.jsx     # popup showing attraction details
    AboutModal.jsx          # "about us" modal triggered from login
    TahiniProgress.jsx      # gamified jar that fills with favorites
    TahiniLoader.jsx        # animated loader (tahini jar bouncing)
    ProtectedRoute.jsx      # redirects to /login if not authenticated
    usersList.jsx           # admin users table
  pages/                    # one component per route
    Login.jsx               # login + register form
    Home.jsx                # main dashboard - cities + attractions + my trips
    TripDetail.jsx          # single trip with matched attractions
    Settings.jsx            # user info + display preferences
    CityAttractions.jsx     # attractions of one city (with admin CRUD)
    adminPortal.jsx         # users list + stats
    adminPortaluser.jsx     # single user admin view (edit, change role, delete)
  services/                 # API communication
    api.js                  # fetch wrapper with auth headers
    authService.js          # login, register, logout
    usersService.js         # /api/users
    citiesService.js        # /api/cities (incl. search)
    attractionsService.js   # /api/attractions (incl. admin CRUD)
    tripsService.js         # /api/profile (trips are "profiles" on the server)
    settingsService.js      # /api/settings
  contexts/                 # global state via React Context
    userContext.jsx         # logged-in user
    preferencesContext.jsx  # display preferences (theme/fontSize/density)
  assets/                   # logos
```

---

## Routes

| Path | Page | Access |
|---|---|---|
| `/login` | Login + Register | public |
| `/` | Home (Dashboard) | logged in |
| `/trips/:id` | Trip detail | logged in |
| `/settings` | User settings | logged in |
| `/cities/:id` | City attractions | logged in |
| `/adminPortal` | Admin user list | admin/manager |
| `/adminPortaluser` | Admin user details | admin/manager |

---

## Features

- **Login + Register** on one page with toggle
- **Smart search** for cities (server-side, debounced) and attractions (client-side)
- **Reusable Card** (`ItemCard`) used in 4+ places
- **Reusable Table** (`DataTable`) used in TripDetail and CityAttractions
- **Display preferences**: light/dark theme, font size (S/M/L), card density - all stored on the server
- **Gamification**: tahini jar that fills as you mark favorites on a trip
- **Role-based UI**: admin/manager see edit and delete buttons; users see only view
- **Custom loader**: animated tahini jar instead of plain "loading..." text

---

## Notes

- Authentication uses headers (`x-user-id`, `x-user-role`) since the assignment doesn't require JWT.
- The user object is saved to localStorage so refresh keeps you logged in.
- Display preferences are also saved to localStorage for an instant first paint, then synced from the server.
