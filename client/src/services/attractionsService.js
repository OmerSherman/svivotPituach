import api from "./api";

async function getAll(filters = {}) {
    // build query string from filters
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

const attractionsService = { getAll, getById, getMapPins };
export default attractionsService;
