// services/citiesService.js
// reads cities from the backend.

import api from "./api";

// GET /api/cities
async function getAll() {
    const res = await api.get("/cities");
    return res.data;
}

// GET /api/cities/:id
async function getById(id) {
    const res = await api.get("/cities/" + id);
    return res.data;
}

// GET /api/cities/search?q=:term
async function search(term) {
    const res = await api.get("/cities/search?q=" + encodeURIComponent(term));
    return res.data;
}

const citiesService = { getAll, getById, search };
export default citiesService;
