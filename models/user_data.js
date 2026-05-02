const path = "./mock_data/users.json";

let users = [];

try {
    users = require(path);
} catch (e) {
    console.error("Error loading JSON:", e);
}

function getUsers() {
    return users;
}

// export the function 
module.exports = {
    getUsers
};