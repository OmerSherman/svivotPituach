import api from "./api";

// get the currently logged-in user
async function getMe() {
    const res = await api.get("/users/me");
    return res.data;
}

// list all users (admin only)
async function getAll() {
    const res = await api.get("/users");
    return res.data;
}

// get one user by id
async function getById(id) {
    const res = await api.get("/users/" + id);
    return res.data;
}

// update a user (admin or manager). matches PUT /api/users/:id
async function update(id, updates) {
    const res = await api.put("/users/" + id, updates);
    return res.data;
}

// delete a user (admin can delete anyone; users can delete themselves)
async function del(id) {
    const res = await api.del("/users/" + id);
    return res.data;
}

const usersService = { getMe, getAll, getById, update, del };
export default usersService;
