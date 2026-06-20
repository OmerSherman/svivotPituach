// fetch helper - all services go through here
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// build auth headers from localStorage
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
        localStorage.removeItem("user");
        return {};
    }
}

async function request(path, options = {}) {
    
    //to test loading add this line of code 
    //await new Promise(resolve => setTimeout(resolve, 3000));
    
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

    // try to parse json even on error - server always returns json
    let payload;
    try {
        payload = await response.json();
    } catch (err) {
        payload = null;
    }

    if (!response.ok) {
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

// shortcuts
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: body }),
    put: (path, body) => request(path, { method: "PUT", body: body }),
    del: (path) => request(path, { method: "DELETE" })
};

export default api;
