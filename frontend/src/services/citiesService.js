import api from "./api";

async function getAll() {
    const res = await api.get("/cities");
    return res.data;
}

async function getById(id) {
    const res = await api.get("/cities/" + id);
    return res.data;
}

async function search(term) {
    const res = await api.get("/cities/search?q=" + encodeURIComponent(term));
    return res.data;
}

const citiesService = { getAll, getById, search };
export default citiesService;
