const favoriteRepo = require('../repositories/favoriteRepo');
const tripRepo = require('../repositories/tripRepo');

function parseUserId(value) {
    const id = parseInt(value, 10);
    return isNaN(id) ? null : id;
}

// GET - all favorites for a user (from trip_attraction across all trips)
async function getFavorites(req, res, next) {
    try {
        const userId = parseUserId(req.query.userId);

        if (!userId) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: 'VALIDATION_ERROR', message: 'userId is required', details: {} }
            });
        }

        const userFavorites = await favoriteRepo.findByUser(userId);
        return res.status(200).json({ success: true, data: userFavorites, error: null });
    } catch (err) {
        next(err);
    }
}

// POST - save attraction to a trip's favorites (requires tripId)
async function addFavorite(req, res, next) {
    try {
        const userId = parseUserId(req.body.userId);
        const tripId = parseUserId(req.body.tripId);
        const itemId = parseUserId(req.body.itemId);
        const itemType = req.body.itemType;

        if (!userId || !tripId || !itemId) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: 'VALIDATION_ERROR', message: 'userId, tripId and itemId are required', details: {} }
            });
        }

        if (itemType !== 'attraction') {
            return res.status(400).json({
                success: false, data: null,
                error: { code: 'VALIDATION_ERROR', message: 'only itemType=attraction is supported', details: {} }
            });
        }

        const trip = await tripRepo.findById(tripId);
        if (!trip || trip.userId !== userId) {
            return res.status(403).json({
                success: false, data: null,
                error: { code: 'FORBIDDEN', message: 'trip not found or not yours', details: {} }
            });
        }

        const added = await favoriteRepo.add(tripId, itemId);
        if (!added) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: 'VALIDATION_ERROR', message: 'this item is already in favorites', details: {} }
            });
        }

        return res.status(201).json({
            success: true,
            data: { id: tripId + '-' + itemId, tripId: tripId, itemId: itemId },
            error: null
        });
    } catch (err) {
        next(err);
    }
}

// DELETE - remove favorite by composite id "tripId-attractionId"
async function removeFavorite(req, res, next) {
    try {
        const rawId = req.params.id;
        const parts = String(rawId).split('-');

        if (parts.length !== 2) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: 'VALIDATION_ERROR', message: 'id must be tripId-attractionId', details: {} }
            });
        }

        const tripId = parseUserId(parts[0]);
        const itemId = parseUserId(parts[1]);

        const removed = await favoriteRepo.remove(tripId, itemId);
        if (!removed) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: 'NOT_FOUND', message: 'favorite ' + rawId + ' not found', details: {} }
            });
        }

        return res.status(200).json({ success: true, data: { id: rawId }, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getFavorites, addFavorite, removeFavorite };
