const profiles = require('../models/mock_data/profiles.json');

// helper - get the current user id from the header
function getUserId(req) {
    const id = parseInt(req.headers['x-user-id']);
    return isNaN(id) ? null : id;
}

// helper - send 401 if not logged in
function requireAuth(req, res) {
    const userId = getUserId(req);
    if (!userId) {
        res.status(401).json({
            success: false, data: null,
            error: { code: "UNAUTHORIZED", message: "not logged in", details: {} }
        });
        return null;
    }
    return userId;
}

// GET /api/profile - list all trips of the current user
function getAll(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const userTrips = profiles.filter(function(p) {
            return p.userId === userId;
        });

        return res.status(200).json({ success: true, data: userTrips, error: null });
    } catch (err) {
        next(err);
    }
}

// GET /api/profile/:id - get a single trip (must be owned by current user)
function getById(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.params.id);
        const trip = profiles.find(function(p) { return p.id === tripId; });

        if (!trip) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "trip not found", details: {} }
            });
        }

        // ownership check - users can only see their own trips
        if (trip.userId !== userId) {
            return res.status(403).json({
                success: false, data: null,
                error: { code: "FORBIDDEN", message: "this trip belongs to another user", details: {} }
            });
        }

        return res.status(200).json({ success: true, data: trip, error: null });
    } catch (err) {
        next(err);
    }
}

// POST /api/profile - create a new trip for the current user
function create(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        // generate next id (max + 1, or 1 if empty)
        const nextId = profiles.length === 0
            ? 1
            : Math.max(...profiles.map(function(p) { return p.id; })) + 1;

        const newTrip = {
            id: nextId,
            userId: userId,
            name: req.body.name,
            countryId: Number(req.body.countryId),
            startMonth: Number(req.body.startMonth),
            endMonth: Number(req.body.endMonth),
            travelerType: req.body.travelerType,
            budgetLevel: req.body.budgetLevel,
            interests: req.body.interests || [],
            favorites: [],
            createdAt: new Date().toISOString()
        };

        profiles.push(newTrip);
        // next stage: save to MySQL

        return res.status(201).json({ success: true, data: newTrip, error: null });
    } catch (err) {
        next(err);
    }
}

// PUT /api/profile/:id - update a trip (ownership check)
function update(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.params.id);
        const trip = profiles.find(function(p) { return p.id === tripId; });

        if (!trip) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "trip not found", details: {} }
            });
        }

        if (trip.userId !== userId) {
            return res.status(403).json({
                success: false, data: null,
                error: { code: "FORBIDDEN", message: "this trip belongs to another user", details: {} }
            });
        }

        // update only the fields that were sent - don't allow changing id/userId
        if (req.body.name         !== undefined) trip.name         = req.body.name;
        if (req.body.countryId    !== undefined) trip.countryId    = Number(req.body.countryId);
        if (req.body.startMonth   !== undefined) trip.startMonth   = Number(req.body.startMonth);
        if (req.body.endMonth     !== undefined) trip.endMonth     = Number(req.body.endMonth);
        if (req.body.travelerType !== undefined) trip.travelerType = req.body.travelerType;
        if (req.body.budgetLevel  !== undefined) trip.budgetLevel  = req.body.budgetLevel;
        if (req.body.interests    !== undefined) trip.interests    = req.body.interests;

        return res.status(200).json({ success: true, data: trip, error: null });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/profile/:id - remove a trip (ownership check)
function remove(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.params.id);
        const index = profiles.findIndex(function(p) { return p.id === tripId; });

        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "trip not found", details: {} }
            });
        }

        if (profiles[index].userId !== userId) {
            return res.status(403).json({
                success: false, data: null,
                error: { code: "FORBIDDEN", message: "this trip belongs to another user", details: {} }
            });
        }

        profiles.splice(index, 1);

        return res.status(200).json({ success: true, data: { id: tripId }, error: null });
    } catch (err) {
        next(err);
    }
}

// POST /api/profile/:id/favorites - toggle an attraction in/out of favorites
// expects body: { attractionId: number }
function toggleFavorite(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.params.id);
        const attractionId = Number(req.body.attractionId);

        if (isNaN(attractionId)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "attractionId is required", details: {} }
            });
        }

        const trip = profiles.find(function(p) { return p.id === tripId; });

        if (!trip) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "trip not found", details: {} }
            });
        }

        if (trip.userId !== userId) {
            return res.status(403).json({
                success: false, data: null,
                error: { code: "FORBIDDEN", message: "this trip belongs to another user", details: {} }
            });
        }

        // toggle - if already in favorites, remove. otherwise add
        if (!trip.favorites) trip.favorites = [];

        const favIndex = trip.favorites.indexOf(attractionId);
        if (favIndex === -1) {
            trip.favorites.push(attractionId);
        } else {
            trip.favorites.splice(favIndex, 1);
        }

        return res.status(200).json({ success: true, data: trip, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove, toggleFavorite };