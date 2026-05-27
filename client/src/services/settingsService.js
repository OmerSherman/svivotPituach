// services/settingsService.js
// the assignment explicitly asks for GET /api/settings and PUT /api/settings.
// we added those endpoints on the server side - they read/update the current user's profile.

import api from "./api";

// GET /api/settings -> the current user's settings (name, email, theme, budgetLevel ...)
async function get() {
    const res = await api.get("/settings");
    return res.data;
}

// PUT /api/settings -> partial update of the current user's settings
async function update(updates) {
    const res = await api.put("/settings", updates);
    return res.data;
}

const settingsService = { get, update };
export default settingsService;
