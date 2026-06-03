import api from "./api";

const STORAGE_KEY = "user";

async function login(email, password) {
    const res = await api.post("/auth/login", { email: email, password: password });
    // save user so api.js can read it for the auth headers
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
    // we call the server but no real session yet so it's just for show
    try {
        await api.post("/auth/logout", {});
    } catch (err) {
        console.warn("logout request failed:", err.message);
    }
    localStorage.removeItem(STORAGE_KEY);
}

const authService = { login, register, logout };
export default authService;
