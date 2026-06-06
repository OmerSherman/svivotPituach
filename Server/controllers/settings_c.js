// settings combine fields from users.json (firstName, lastName, email)
// with display preferences from settings.json (theme, fontSize, density)

const users    = require('../models/mock_data/users.json');
const settings = require('../models/mock_data/settings.json');

// allowed values for the preferences - used for validation
const VALID_THEMES   = ["light", "dark"];
const VALID_SIZES    = ["small", "medium", "large"];
const VALID_DENSITY  = ["compact", "normal", "spacious"];

// default preferences for a user who hasn't saved any
function defaultPreferences() {
    return { theme: "light", fontSize: "medium", density: "normal" };
}

function getCurrentUser(req) {
    const id = parseInt(req.headers['x-user-id']);
    if (isNaN(id)) return null;
    return users.find(function(u) { return u.userId === id; }) || null;
}

// returns the user's settings row, or a default if none exists
function getCurrentSettings(req) {
    const id = parseInt(req.headers['x-user-id']);
    if (isNaN(id)) return Object.assign({}, defaultPreferences(), { userId: 0 });

    const existing = settings.find(function(s) { return s.userId === id; });
    if (existing) {
        // merge with defaults to be safe if some fields are missing
        return Object.assign({}, defaultPreferences(), existing);
    }
    // no row yet - return defaults
    return Object.assign({ userId: id }, defaultPreferences());
}

// GET /api/settings - return user info + preferences merged
function getSettings(req, res, next) {
    try {
        const user = getCurrentUser(req);
        if (!user) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        const prefs = getCurrentSettings(req);

        const data = {
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            theme:     prefs.theme,
            fontSize:  prefs.fontSize,
            density:   prefs.density
        };

        return res.status(200).json({ success: true, data: data, error: null });
    } catch (err) {
        next(err);
    }
}

// PUT /api/settings - update user info and/or preferences
function updateSettings(req, res, next) {
    try {
        const user = getCurrentUser(req);
        if (!user) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        // validate email format if it was sent
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

        // validate the preference values to prevent garbage from being stored
        if (req.body.theme !== undefined && !VALID_THEMES.includes(req.body.theme)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "theme must be light or dark", details: {} }
            });
        }
        if (req.body.fontSize !== undefined && !VALID_SIZES.includes(req.body.fontSize)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "fontSize must be small/medium/large", details: {} }
            });
        }
        if (req.body.density !== undefined && !VALID_DENSITY.includes(req.body.density)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "density must be compact/normal/spacious", details: {} }
            });
        }

        // update user info fields (only ones that were sent)
        if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
        if (req.body.lastName  !== undefined) user.lastName  = req.body.lastName;
        if (req.body.email     !== undefined) user.email     = req.body.email;
        user.updateDate = new Date().toISOString();

        // update preferences - find existing row or create a new one
        const userId = parseInt(req.headers['x-user-id']);
        let row = settings.find(function(s) { return s.userId === userId; });
        if (!row) {
            row = Object.assign({ userId: userId }, defaultPreferences());
            settings.push(row);
        }
        if (req.body.theme    !== undefined) row.theme    = req.body.theme;
        if (req.body.fontSize !== undefined) row.fontSize = req.body.fontSize;
        if (req.body.density  !== undefined) row.density  = req.body.density;

        // return the same shape as GET so the client can use it directly
        const updated = {
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            theme:     row.theme,
            fontSize:  row.fontSize,
            density:   row.density
        };

        return res.status(200).json({ success: true, data: updated, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSettings, updateSettings };
