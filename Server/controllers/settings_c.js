// controllers/settings_c.js
// the Assignment 3 spec asks for GET /api/settings and PUT /api/settings.
// "Settings" here means the editable preferences of the logged-in user:
//   - firstName, lastName, email   (from users.json)
//   - travelerType, budgetLevel, theme  (from profiles.json + a new field)
//
// the user is identified by the x-user-id header (the same mock auth the
// rest of the app uses).

const users = require('../models/mock_data/users.json');
const profiles = require('../models/mock_data/profiles.json');

// helper - find current user from headers
function getCurrentUser(req) {
    const id = parseInt(req.headers['x-user-id']);
    if (isNaN(id)) return null;
    return users.find(function(u) { return u.userId === id; }) || null;
}

// helper - find or initialize the profile for a user
function getOrCreateProfile(userId) {
    let profile = profiles.find(function(p) { return p.userId === userId; });
    if (!profile) {
        profile = {
            id: profiles.length + 1,
            userId: userId,
            travelerType: "solo",
            interests: [],
            budgetLevel: "medium",
            theme: "light"
        };
        profiles.push(profile);
    }
    return profile;
}

// GET /api/settings -> all editable fields for the current user, in one object
function getSettings(req, res, next) {
    try {
        const user = getCurrentUser(req);
        if (!user) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        const profile = getOrCreateProfile(user.userId);

        const settings = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            travelerType: profile.travelerType,
            budgetLevel: profile.budgetLevel,
            theme: profile.theme || "light"
        };

        return res.status(200).json({ success: true, data: settings, error: null });
    } catch (err) {
        next(err);
    }
}

// PUT /api/settings -> partial update of the current user's settings
function updateSettings(req, res, next) {
    try {
        const user = getCurrentUser(req);
        if (!user) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        // basic validation - email must look like an email if provided
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

        // update user fields
        if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
        if (req.body.lastName  !== undefined) user.lastName  = req.body.lastName;
        if (req.body.email     !== undefined) user.email     = req.body.email;
        user.updateDate = new Date().toISOString();

        // update profile fields
        const profile = getOrCreateProfile(user.userId);
        if (req.body.travelerType !== undefined) profile.travelerType = req.body.travelerType;
        if (req.body.budgetLevel  !== undefined) profile.budgetLevel  = req.body.budgetLevel;
        if (req.body.theme        !== undefined) profile.theme        = req.body.theme;

        // return the new full settings object
        const updated = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            travelerType: profile.travelerType,
            budgetLevel: profile.budgetLevel,
            theme: profile.theme || "light"
        };

        return res.status(200).json({ success: true, data: updated, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSettings, updateSettings };
