const path = "./mock_data/users.json";
const utils = require("../utils/utils_general")
let users = [];

try {
    users = require(path);
} catch (e) {
    console.error("Error loading JSON:", e);
}

function getUsers() {
    return users;
}

//save the json object to the users. return status boolean.
function writeUser(json) {
    return utils.addObjectToJsonFile(path, json)
}

// export the function 
module.exports = {
    getUsers,
    writeUser
};