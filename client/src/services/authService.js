import api from "./api";

const STORAGE_KEY = "user";

async function login(email, password) {
    const res = await api.post("/auth/login", { email: email, password: password });
    // save user so api.js can use it for the headers
    //todo : check if login succesd and then save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    return res.data;
}

async function register(firstName, lastName, email, password) {
    const res = await api.post("/auth/register", {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    });
    return res.data;
}

async function logout() {
    // we still call the server but no real session yet
    try {
        await api.post("/auth/logout", {});
    } catch (err) {
        console.warn("logout request failed:", err.message);
    }
    localStorage.removeItem(STORAGE_KEY);
}

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
