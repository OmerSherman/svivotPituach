
const userData = require("../models/user_data.js");

function getById(req, res) {
    const id = parseInt(req.params.id); //parse id parameter from url of user
    
    const allUsers = userData.getUsers(); //get all users 
    console.log(allUsers)
    const user = allUsers.find((u) => u.userId === id); //find user

    if (!user) { //if user id not exsist
        return res.status(404).json({
            error: `User with id ${id} not found`
        });
    }
    return res.json(user);
}

module.exports = {
    getById
};