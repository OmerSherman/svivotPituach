// services/authService.js
// handles login / register / logout against the backend.
// the backend has no JWT yet - we just remember the user in localStorage.

import api from "./api";

const STORAGE_KEY = "user";

// POST /api/auth/login -> { userId, firstName, userRole }
// note: the assignment requires the path /api/auth/login. We added that
// endpoint to the server as an alias of the original /api/users/login.
async function login(email, password) {
    const res = await api.post("/auth/login", { email: email, password: password });

    // save the user so the rest of the app can read it (used by api.js for headers)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));

    return res.data;
}

// POST /api/users/register
async function register(firstName, lastName, email, password) {
    const res = await api.post("/users/register", {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    });
    return res.data;
}

// POST /api/auth/logout
// the server has no real session, but we still call it so the URL the assignment
// asks for actually exists and answers.
async function logout() {
    try {
        await api.post("/auth/logout", {});
    } catch (err) {
        // even if the server call fails we still want to clear the client state
        console.warn("logout request failed:", err.message);
    }
    localStorage.removeItem(STORAGE_KEY);
}

// returns the user object stored in localStorage (or null)
function getStoredUser() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (err) {
        return null;
    }
}

const authService = { login, register, logout, getStoredUser };
export default authService;
