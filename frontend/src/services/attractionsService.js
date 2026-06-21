import api from "./api";

// fetch all attractions, with optional filters and trip personalization
async function getAll(filters = {}) {
    const params = [];
    if (filters.cityId) params.push("city_id=" + filters.cityId);
    if (filters.type) params.push("type=" + filters.type);
    if (filters.travelStyle) params.push("travelStyle=" + encodeURIComponent(filters.travelStyle));
    if (filters.startMonth) params.push("startMonth=" + filters.startMonth);
    if (filters.endMonth) params.push("endMonth=" + filters.endMonth);
    if (filters.interests && filters.interests.length > 0) {
        params.push("interests=" + encodeURIComponent(filters.interests.join(",")));
    }

    const query = params.length > 0 ? "?" + params.join("&") : "";
    const res = await api.get("/attractions" + query);
    return res.data;
}

async function getTop(options = {}) {
    const params = [];
    if (options.minScore) params.push("min_score=" + options.minScore);
    if (options.limit) params.push("limit=" + options.limit);
    const query = params.length > 0 ? "?" + params.join("&") : "";
    const res = await api.get("/attractions/top" + query);
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

const attractionsService = { getAll, getTop, getById, getMapPins, create, update, remove };
export default attractionsService;
