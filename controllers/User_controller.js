const users = require("../models/mock_data/users.json")

// helper to find user by id
function findById(id) {
    return users.find(function(u) {
        return u.userId === parseInt(id);
    });
}

// GET - all users
function getAll(req, res) {
    return res.status(200).json({
        success: true,
        data: users,
        error: null
    });
}

// GET - one user by id
function getById(req, res) {
    const id = req.params.id;
    const user = findById(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "user " + id + " not found",
                details: {}
            }
        });
    }

    return res.status(200).json({
        success: true,
        data: user,
        error: null
    });
}

// POST - create a new user
function create(req, res) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const userRole = req.body.userRole;

    if (!firstName || !lastName || !userRole) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "please fill in all fields",
                details: {}
            }
        });
    }

    const newUser = {
        userId: users.length + 1, // next stage: id will be auto-incremented by MySQL
        firstName: firstName,
        lastName: lastName,
        userRole: userRole,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
    };

    users.push(newUser);
    
    return res.status(201).json({
        success: true,
        data: { userId: newUser.userId },
        error: null
    });
}

// PUT - update a user (only the fields that were sent)
function update(req, res) {
    const id = req.params.id;
    const user = findById(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "user " + id + " not found",
                details: {}
            }
        });
    }

    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.userRole) user.userRole = req.body.userRole;
    user.updateDate = new Date().toISOString();

    return res.status(200).json({
        success: true,
        data: { userId: parseInt(id) },
        error: null
    });
}

// DELETE - remove a user
function remove(req, res) {
    const requestingRole = req.headers['x-user-role'];
    const requestingId = req.headers['x-user-id'];
    const targetId = req.params.id;

    // if not admin, check that user is deleting themselves
    if (requestingRole !== 'admin' && parseInt(requestingId) !== parseInt(targetId)) {
        return res.status(403).json({
            success: false,
            data: null,
            error: {
                code: "FORBIDDEN",
                message: "you can only delete your own account",
                details: {}
            }
        });
    }

    return remove_inner(targetId, req, res);
}

function remove_inner(id , req, res){
    const index = users.findIndex(function(u) {
        return u.userId === parseInt(id);
    });

    if (index === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "user " + id + " not found",
                details: {}
            }
        });
    }

    users.splice(index, 1);
    // todo next stage: delete from MySQL
    return res.status(200).json({
        success: true,
        data: { userId: parseInt(id) },
        error: null
    });
}

module.exports = { getAll, getById, create, update, remove };
