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
Client runs on port 3001 (set in `.env`).

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
  components/   - Navbar, Footer, Layout, ItemCard, DataTable, attraction_card
  pages/        - Login, Home, Settings, CityAttractions
  services/     - api.js + one service per entity
  App.js        - routing
```

## Routes

- `/login` - login page
- `/` - home / dashboard
- `/settings` - user settings
- `/cities/:id` - city attractions (table + cards)

## Notes

- Mock auth using `x-user-role` and `x-user-id` headers (no JWT yet).
- User is saved in localStorage after login.
