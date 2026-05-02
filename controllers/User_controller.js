
const user_data = require("./models/user_data.js")

function getUsers(){
    return user_data.getUsers()
}

function getById(req, res) {
    const id =
    parseInt(req.params.id);
    const user = getUsers().find((u)
    => u.id === id);
    if (!user) {
        return res.status(404).json({
        error: `User with id ${id} not
        found` });
    }
    res.json(user)
}

