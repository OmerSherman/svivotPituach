// services/api.js
// Tiny fetch wrapper used by all the service files.
// We use the native fetch (the course teaches fetch, not axios).

// base URL comes from .env (REACT_APP_API_URL). If missing, we fall back to
// the default address of the Assignment 2 backend.
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// reads the logged-in user from localStorage and builds the auth headers
// the backend expects: x-user-role and x-user-id (mock auth from Assignment 2)
function buildAuthHeaders() {
    const stored = localStorage.getItem("user");
    if (!stored) {
        return {};
    }

    try {
        const user = JSON.parse(stored);
        return {
            "x-user-role": user.userRole,
            "x-user-id": String(user.userId)
        };
    } catch (err) {
        // corrupted localStorage - clear it and continue without auth headers
        localStorage.removeItem("user");
        return {};
    }
}

// the actual request function. Every service file goes through here.
// it returns the parsed JSON on success and throws an Error on failure,
// so callers can use a normal try/catch around it.
async function request(path, options = {}) {
    const url = API_URL + path;

    const headers = {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
        ...(options.headers || {})
    };

    const config = {
        method: options.method || "GET",
        headers: headers
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    // try to parse the body even on errors (the server always returns JSON)
    let payload;
    try {
        payload = await response.json();
    } catch (err) {
        payload = null;
    }

    if (!response.ok) {
        // backend wraps errors as { success:false, data:null, error:{ code, message, details } }
        const message = payload && payload.error && payload.error.message
            ? payload.error.message
            : "Request failed (" + response.status + ")";
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}

// small wrappers so service files read nicely
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: body }),
    put: (path, body) => request(path, { method: "PUT", body: body }),
    del: (path) => request(path, { method: "DELETE" })
};

export default api;
