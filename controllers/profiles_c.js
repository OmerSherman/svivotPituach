const profiles = require('../models/mock_data/profiles.json');

// POST - save traveler preferences for a user
// if profile already exists, update it. otherwise create a new one
function saveProfile(req, res, next) {
    try {
        const userId = req.body.userId;
        const travelerType = req.body.travelerType; // solo, couple, family, group
        const interests = req.body.interests;       // e.g ['history', 'food', 'nature']
        const budgetLevel = req.body.budgetLevel;   // low, medium, high

        // check if this user already has a profile
        const existing = profiles.find(function(p) {
            return p.userId === userId;
        });

        if (existing) {
            existing.travelerType = travelerType;
            existing.interests = interests;
            existing.budgetLevel = budgetLevel;
            // next stage: update in MySQL

            return res.status(200).json({ success: true, data: { userId: userId }, error: null });
        }

        const newProfile = {
            id: profiles.length + 1,
            userId: userId,
            travelerType: travelerType,
            interests: interests,
            budgetLevel: budgetLevel
        };

        profiles.push(newProfile);
        // next stage: save to MySQL

        return res.status(201).json({ success: true, data: { userId: userId }, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { saveProfile };
