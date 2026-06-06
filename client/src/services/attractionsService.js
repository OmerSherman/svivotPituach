import api from "./api";

// fetch all attractions, with optional filters
async function getAll(filters = {}) {
    const params = [];
    if (filters.cityId) params.push("city_id=" + filters.cityId);
    if (filters.type)   params.push("type=" + filters.type);

    const query = params.length > 0 ? "?" + params.join("&") : "";
    const res = await api.get("/attractions" + query);
    return res.data;
}

async function getById(id) {
    const res = await api.get("/attractions/" + id);
    return res.data;
}

async function getMapPins(cityId) {
    const res = await api.get("/attractions/map?city_id=" + cityId);
    return res.data;
}

// admin only - create a new attraction
async function create(data) {
    const res = await api.post("/attractions", data);
    return res.data;
}

// admin or manager - update an attraction
async function update(id, data) {
    const res = await api.put("/attractions/" + id, data);
    return res.data;
}

// admin only - delete an attraction
async function remove(id) {
    const res = await api.del("/attractions/" + id);
    return res.data;
}

const attractionsService = { getAll, getById, getMapPins, create, update, remove };
export default attractionsService;
