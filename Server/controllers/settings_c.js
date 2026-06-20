const UserORM    = require('../ORM/UserORM');
const SettingsORM = require('../ORM/SettingsORM');

const VALID_THEMES  = ["light", "dark"];
const VALID_SIZES   = ["small", "medium", "large"];
const VALID_DENSITY = ["compact", "normal", "spacious"];

async function getSettings(req, res, next) {
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
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        const prefs = await SettingsORM.findByUser(id);

        return res.status(200).json({
            success: true,
            data: {
                firstName: user.firstName,
                lastName:  user.lastName,
                email:     user.email,
                theme:     prefs.theme,
                fontSize:  prefs.fontSize,
                density:   prefs.density
            },
            error: null
        });
    } catch (err) {
        next(err);
    }
}

async function updateSettings(req, res, next) {
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
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
            });
        }

        if (req.body.theme    !== undefined && !VALID_THEMES.includes(req.body.theme)) {
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
        if (req.body.density  !== undefined && !VALID_DENSITY.includes(req.body.density)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "density must be compact/normal/spacious", details: {} }
            });
        }

        const userFields = {};
        if (req.body.firstName !== undefined) userFields.firstName = req.body.firstName;
        if (req.body.lastName  !== undefined) userFields.lastName  = req.body.lastName;
        if (req.body.email     !== undefined) userFields.email     = req.body.email;

        if (Object.keys(userFields).length > 0) {
            await UserORM.update(id, userFields);
        }

        const prefs = await SettingsORM.findByUser(id);
        await SettingsORM.upsert(id, {
            theme:    req.body.theme    !== undefined ? req.body.theme    : prefs.theme,
            fontSize: req.body.fontSize !== undefined ? req.body.fontSize : prefs.fontSize,
            density:  req.body.density  !== undefined ? req.body.density  : prefs.density
        });

        const updated      = await UserORM.findById(id);
        const updatedPrefs = await SettingsORM.findByUser(id);

        return res.status(200).json({
            success: true,
            data: {
                firstName: updated.firstName,
                lastName:  updated.lastName,
                email:     updated.email,
                theme:     updatedPrefs.theme,
                fontSize:  updatedPrefs.fontSize,
                density:   updatedPrefs.density
            },
            error: null
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSettings, updateSettings };
