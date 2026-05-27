const users = require("../models/mock_data/users.json");

// helper to find user by id
function findById(id) {
    return users.find(function(u) {
        return u.userId === parseInt(id);
    });
}

// GET - all users
function getAll(req, res, next) {
    try {
        return res.status(200).json({ success: true, data: users, error: null });
    } catch (err) {
        next(err);
    }
}

// GET - one user by id
function getById(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const user = findById(id);

        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "user " + id + " not found", details: {} }
            });
        }

        return res.status(200).json({ success: true, data: user, error: null });
    } catch (err) {
        next(err);
    }
}

// POST - create a new user
// required fields validated by checkFields middleware in the route
function create(req, res, next) {
    try {
        const newUser = {
            userId: users.length + 1, // next stage: auto-incremented by MySQL
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userRole: req.body.userRole,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString()
        };

        users.push(newUser);

        return res.status(201).json({ success: true, data: { userId: newUser.userId }, error: null });
    } catch (err) {
        next(err);
    }
}

// PUT - update a user (only the fields that were sent)
function update(req, res, next) {
    try {
        const id = req.params.id;
        const requestingRole = req.headers['x-user-role'];

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const user = findById(id);

        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "user " + id + " not found", details: {} }
            });
        }

        // manager can only change userRole
        if (requestingRole === 'manager') {
            if (req.body.userRole) user.userRole = req.body.userRole;
            user.updateDate = new Date().toISOString();
            return res.status(200).json({ success: true, data: { userId: parseInt(id) }, error: null });
        }

        // admin can update everything
        if (req.body.firstName) user.firstName = req.body.firstName;
        if (req.body.lastName) user.lastName = req.body.lastName;
        if (req.body.userRole) user.userRole = req.body.userRole;
        user.updateDate = new Date().toISOString();

        return res.status(200).json({ success: true, data: { userId: parseInt(id) }, error: null });
    } catch (err) {
        next(err);
    }
}

// DELETE - remove a user
// admin can delete anyone, user can only delete themselves
function remove(req, res, next) {
    try {
        const requestingRole = req.headers['x-user-role'];
        const requestingId = req.headers['x-user-id'];
        const targetId = req.params.id;

        if (isNaN(parseInt(targetId))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        if (requestingRole !== 'admin' && parseInt(requestingId) !== parseInt(targetId)) {
            return res.status(403).json({
                success: false, data: null,
                error: { code: "FORBIDDEN", message: "you can only delete your own account", details: {} }
            });
        }

        const index = users.findIndex(function(u) {
            return u.userId === parseInt(targetId);
        });

        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "user " + targetId + " not found", details: {} }
            });
        }

        users.splice(index, 1);
        // next stage: delete from MySQL

        return res.status(200).json({ success: true, data: { userId: parseInt(targetId) }, error: null });
    } catch (err) {
        next(err);
    }
}

// GET /me - returns the currently logged-in user (based on x-user-id header).
// Required by Assignment 3 ("GET /api/users/me").
function getMe(req, res, next) {
    try {
        const id = parseInt(req.headers['x-user-id']);
        if (isNaN(id)) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        const user = findById(id);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "user " + id + " not found", details: {} }
            });
        }

        // never send the password back to the client
        const safeUser = {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userRole: user.userRole,
            createDate: user.createDate,
            updateDate: user.updateDate
        };

        return res.status(200).json({ success: true, data: safeUser, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove, getMe };
