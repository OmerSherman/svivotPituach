

let users = [];
const path = "/mock_data/users.json";

function loadUsers() { 
    //load the users from the mock data
    const response = await fetch(path);
    const data = await response.json();
    users = data;
}

function getUsers() {
    return users;
}

loadUsers()