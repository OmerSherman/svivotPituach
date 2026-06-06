// settings include user info AND display preferences (theme, font size, density)

const users = require('../models/mock_data/users.json');

function getCurrentUser(req) {
    const id = parseInt(req.headers['x-user-id']);
    if (isNaN(id)) return null;
    return users.find(function(u) { return u.userId === id; }) || null;
}

// default preferences if the user hasn't saved any yet
function defaultPreferences() {
    return { theme: "light", fontSize: "medium", density: "normal" };
}

function getSettings(req, res, next) {
    try {
        const user = getCurrentUser(req);
        if (!user) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        // merge defaults with anything the user already saved
        const preferences = Object.assign(defaultPreferences(), user.preferences || {});

        const settings = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            preferences: preferences
        };

        return res.status(200).json({ success: true, data: settings, error: null });
    } catch (err) {
        next(err);
    }
}

function updateSettings(req, res, next) {
    try {
        const user = getCurrentUser(req);
        if (!user) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        // basic email check
        if (req.body.email !== undefined) {
            const emailLooksOk = typeof req.body.email === "string" &&
                                 req.body.email.indexOf("@") > 0 &&
                                 req.body.email.indexOf(".") > 0;
            if (!emailLooksOk) {
                return res.status(400).json({
                    success: false, data: null,
                    error: { code: "VALIDATION_ERROR", message: "email format is invalid", details: { field: "email" } }
                });
            }
        }

        // update basic info
        if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
        if (req.body.lastName  !== undefined) user.lastName  = req.body.lastName;
        if (req.body.email     !== undefined) user.email     = req.body.email;

        // update preferences - merge with existing so a single field can be updated
        if (req.body.preferences !== undefined) {
            user.preferences = Object.assign(
                defaultPreferences(),
                user.preferences || {},
                req.body.preferences
            );
        }

        user.updateDate = new Date().toISOString();

        const updated = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            preferences: user.preferences || defaultPreferences()
        };

        return res.status(200).json({ success: true, data: updated, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSettings, updateSettings };
