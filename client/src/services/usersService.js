// services/usersService.js
// CRUD against /api/users + the /me endpoint required by the assignment.

import api from "./api";

// GET /api/users/me -> the logged-in user (based on x-user-id header)
async function getMe() {
    const res = await api.get("/users/me");
    return res.data;
}

// GET /api/users -> all users (admin only on the server)
async function getAll() {
    const res = await api.get("/users");
    return res.data;
}

// GET /api/users/:id
async function getById(id) {
    const res = await api.get("/users/" + id);
    return res.data;
}

// PUT /api/users/:id (admin/manager only on the server)
async function update(id, updates) {
    const res = await api.put("/users/" + id, updates);
    return res.data;
}

const usersService = { getMe, getAll, getById, update };
export default usersService;
