import api from "./api";

async function getAll() {
    const res = await api.get("/countries");
    return res.data;
}

async function getById(id) {
    const res = await api.get("/countries/" + id);
    return res.data;
}

const countriesService = { getAll, getById };
export default countriesService;
