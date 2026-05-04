const profiles = require('../models/mock_data/profiles.json');

// POST /api/profile - save traveler profile for a user
function saveProfile(req, res) {
    const userId = req.body.userId;
    const travelerType = req.body.travelerType; // e.g. 'family', 'couple', 'solo'
    const interests = req.body.interests;       // e.g. ['history', 'food']
    const budgetLevel = req.body.budgetLevel;   // e.g. 'low', 'medium', 'high'

    if (!userId || !travelerType || !interests || !budgetLevel) {
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

    // check if profile already exists for this user - if so, update it
    const existing = profiles.find(function(p) {
        return p.userId === userId;
    });

    if (existing) {
        existing.travelerType = travelerType;
        existing.interests = interests;
        existing.budgetLevel = budgetLevel;

        return res.status(200).json({
            success: true,
            data: { userId: userId },
            error: null
        });
    }

    // create new profile
    const newProfile = {
        id: profiles.length + 1,
        userId: userId,
        travelerType: travelerType,
        interests: interests,
        budgetLevel: budgetLevel
    };

    profiles.push(newProfile);

    return res.status(201).json({
        success: true,
        data: { userId: userId },
        error: null
    });
}

module.exports = { saveProfile };