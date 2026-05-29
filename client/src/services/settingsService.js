import api from "./api";

async function get() {
    const res = await api.get("/settings");
    return res.data;
}

async function update(updates) {
    const res = await api.put("/settings", updates);
    return res.data;
}

const settingsService = { get, update };
export default settingsService;
