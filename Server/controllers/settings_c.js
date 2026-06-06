// settings combine fields from users.json and profiles.json

const users = require('../models/mock_data/users.json');
const profiles = require('../models/mock_data/profiles.json');
const settings = require("../models/mock_data/settings")

function getCurrentUser(req) {
    const id = parseInt(req.headers['x-user-id']);
    if (isNaN(id)) return null;
    return users.find(function(u) { return u.userId === id; }) || null;
}

function getCurrentSettings(req){
    const id = parseInt(req.headers['x-user-id']);
    if (isNaN(id)) return null;
    return settings.find((u)=> {return u.userId === id}) ||{userId:id , "theme" : "light"}

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
        const settings =getCurrentSettings(req)
       
        data = {
            "firstName" :user.firstName,
            "email" : user.email,
            "theme" : settings.theme
        }
        
        return res.status(200).json({ success: true, data: data, error: null });
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

        // simple email check
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
        const settings = getCurrentSettings(req)

        // only update fields that were sent
        if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
        if (req.body.email     !== undefined) user.email     = req.body.email;
        if (req.body.theme     !== undefined) settings.theme = req.body.theme;
        user.updateDate = new Date().toISOString();

        const updatedUser = {
            firstName: user.firstName,
          
            email: user.email
        };

        const updatedSettings = { 
            theme:settings.theme
        }

        return res.status(200).json({ success: true, data: updated, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSettings, updateSettings };
