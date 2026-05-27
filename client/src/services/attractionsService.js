// services/attractionsService.js
// reads attractions from the backend with optional filters.

import api from "./api";

// GET /api/attractions  (optional filters: cityId, type)
async function getAll(filters = {}) {
    const params = [];
    if (filters.cityId) params.push("city_id=" + filters.cityId);
    if (filters.type)   params.push("type=" + filters.type);

    const query = params.length > 0 ? "?" + params.join("&") : "";
    const res = await api.get("/attractions" + query);
    return res.data;
}

// GET /api/attractions/:id
async function getById(id) {
    const res = await api.get("/attractions/" + id);
    return res.data;
}

// GET /api/attractions/map?city_id=:id  - lightweight pins for a map
async function getMapPins(cityId) {
    const res = await api.get("/attractions/map?city_id=" + cityId);
    return res.data;
}

const attractionsService = { getAll, getById, getMapPins };
export default attractionsService;
