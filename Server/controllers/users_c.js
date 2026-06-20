const UserORM = require('../ORM/UserORM');

async function getAll(req, res, next) {
    try {
        const users = await UserORM.findAll();
        return res.status(200).json({ success: true, data: users, error: null });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const user = await UserORM.findById(id);
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

async function create(req, res, next) {
    try {
        const userId = await UserORM.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            userRole: req.body.userRole || 'user'
        });

        return res.status(201).json({ success: true, data: { userId }, error: null });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const id = req.params.id;
        const requestingRole = req.headers['x-user-role'];

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const user = await UserORM.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "user " + id + " not found", details: {} }
            });
        }

        // manager can only change userRole
        if (requestingRole === 'manager') {
            await UserORM.update(id, { userRole: req.body.userRole });
        } else {
            await UserORM.update(id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userRole: req.body.userRole
            });
        }

        return res.status(200).json({ success: true, data: { userId: parseInt(id) }, error: null });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
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

        const user = await UserORM.findById(targetId);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "user " + targetId + " not found", details: {} }
            });
        }

        await UserORM.delete(targetId);

        return res.status(200).json({ success: true, data: { userId: parseInt(targetId) }, error: null });
    } catch (err) {
        next(err);
    }
}

async function getMe(req, res, next) {
    try {
        const id = parseInt(req.headers['x-user-id']);
        if (isNaN(id)) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        const user = await UserORM.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "user " + id + " not found", details: {} }
            });
        }

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

async function updateMe(req, res, next) {
    try {
        const id = parseInt(req.headers['x-user-id']);
        if (isNaN(id)) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        const user = await UserORM.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "not logged in", details: {} }
            });
        }

        const fields = {};
        if (req.body.firstName !== undefined) fields.firstName = req.body.firstName;
        if (req.body.lastName  !== undefined) fields.lastName  = req.body.lastName;
        if (req.body.email     !== undefined) fields.email     = req.body.email;

        await UserORM.update(id, fields);

        const updated = await UserORM.findById(id);

        return res.status(200).json({
            success: true,
            data: {
                firstName: updated.firstName,
                lastName: updated.lastName,
                email: updated.email,
                updateDate: updated.updateDate
            },
            error: null
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove, getMe, updateMe };
