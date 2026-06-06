import api from "./api";

async function get() {
    const res = await api.get("/settings");
    return res.data;
}

async function update(updates) {
    const res = await api.put("/settings", updates);
    return res.data;
}

// only update preferences, no other fields
async function updatePreferences(preferences) {
    const res = await api.put("/settings", { preferences: preferences });
    return res.data;
}

const settingsService = { get, update, updatePreferences };
export default settingsService;
