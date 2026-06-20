const tripRepo = require('../repositories/tripRepo');

function getUserId(req) {
    const id = parseInt(req.headers['x-user-id']);
    return isNaN(id) ? null : id;
}

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

async function getAll(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const trips = await tripRepo.findByUser(userId);
        return res.status(200).json({ success: true, data: trips, error: null });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.params.id);
        const trip = await tripRepo.findById(tripId);

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

        return res.status(200).json({ success: true, data: trip, error: null });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = await tripRepo.create({
            userId,
            name: req.body.name,
            countryId: Number(req.body.countryId),
            startMonth: Number(req.body.startMonth),
            endMonth: Number(req.body.endMonth),
            travelerType: req.body.travelerType,
            budgetLevel: req.body.budgetLevel,
            interests: req.body.interests || []
        });

        const newTrip = await tripRepo.findById(tripId);
        return res.status(201).json({ success: true, data: newTrip, error: null });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.params.id);
        const trip = await tripRepo.findById(tripId);

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

        const fields = {};
        if (req.body.name         !== undefined) fields.name         = req.body.name;
        if (req.body.countryId    !== undefined) fields.countryId    = Number(req.body.countryId);
        if (req.body.startMonth   !== undefined) fields.startMonth   = Number(req.body.startMonth);
        if (req.body.endMonth     !== undefined) fields.endMonth     = Number(req.body.endMonth);
        if (req.body.travelerType !== undefined) fields.travelerType = req.body.travelerType;
        if (req.body.budgetLevel  !== undefined) fields.budgetLevel  = req.body.budgetLevel;
        if (req.body.interests    !== undefined) fields.interests    = req.body.interests;

        await tripRepo.update(tripId, fields);

        const updated = await tripRepo.findById(tripId);
        return res.status(200).json({ success: true, data: updated, error: null });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const userId = requireAuth(req, res);
        if (!userId) return;

        const tripId = parseInt(req.params.id);
        const trip = await tripRepo.findById(tripId);

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

        await tripRepo.delete(tripId);
        return res.status(200).json({ success: true, data: { id: tripId }, error: null });
    } catch (err) {
        next(err);
    }
}

async function toggleFavorite(req, res, next) {
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

        const trip = await tripRepo.findById(tripId);

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

        await tripRepo.toggleFavorite(tripId, attractionId);

        const updated = await tripRepo.findById(tripId);
        return res.status(200).json({ success: true, data: updated, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove, toggleFavorite };
