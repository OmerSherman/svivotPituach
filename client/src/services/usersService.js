import api from "./api";

async function getMe() {
    const res = await api.get("/users/me");
    return res.data;
}

async function updateMe(updates) {
    const res = await api.put("/users/me")
}

async function getAll() {
    const res = await api.get("/users");
    return res.data;
}

async function getById(id) {
    const res = await api.get("/users/" + id);
    return res.data;
}

async function update(id, updates) {
    const res = await api.put("/users/" + id, updates);
    return res.data;
}

async function del(id) {
    const res = await api.del("/users/" + id)
    return res.data
}

const usersService = { getMe, getAll, getById, update , del, updateMe };
export default usersService;
