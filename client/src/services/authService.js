import api from "./api";


async function login(email, password) {
    const res = await api.post("/auth/login", { email: email, password: password });
    // save user so api.js can use it for the headers
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
}

const authService = { login, register, logout };
export default authService;
