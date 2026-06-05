# Shvil HaTahina - Client

React frontend for Assignment 3.

Team: Omer Sherman, Hillel Zilberman, Michal Adam

## Run

Server first:
```
cd Server
npm install
node app.js
```
Server runs on port 3000.

Then client (in another terminal):
```
cd client
npm install
npm start
```
Client runs on port 5173 (set in `.env`).

API base URL: `http://localhost:3000`

## Test users

All have password `1234`:
- michal@example.com (admin)
- omer@example.com (admin)
- hillel@example.com (manager)
- user@example.com (user)

## Project structure

```
src/
  components/   - Navbar, Footer, Layout, Form, ItemCard, DataTable,
                  TripForm, AttractionModal, ProtectedRoute
  pages/        - Login, MyTrips, TripDetail, Settings, CityAttractions
  services/     - api.js + one service per entity (auth, users, cities,
                  attractions, settings, trips)
  contexts/     - userContext (logged-in user across the app)
  assets/       - logo files
  App.js        - routing
```

## Routes

- `/login` - login + register
- `/` - my trips dashboard (main page after login)
- `/trips/:id` - single trip view with filtered attractions
- `/settings` - user settings
- `/cities/:id` - city attractions (table + cards)

## Notes

- Mock auth using `x-user-role` and `x-user-id` headers (no JWT yet).
- Logged-in user is saved in localStorage so refresh keeps the session.
- Planned trips are saved on the server in profiles.json.
