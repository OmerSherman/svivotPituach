const favorites = [];

// GET - all saved items for a specific user
function getFavorites(req, res, next) {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "userId is required", details: {} }
            });
        }

        const userFavorites = favorites.filter(function(f) {
            return f.userId === parseInt(userId);
        });

        return res.status(200).json({ success: true, data: userFavorites, error: null });
    } catch (err) {
        next(err);
    }
}

// POST - save an item to the user's favorites list
// required fields validated by checkFields middleware in the route
function addFavorite(req, res, next) {
    try {
        const userId = req.body.userId;
        const itemId = req.body.itemId;
        const itemType = req.body.itemType; // attraction, restaurant, hotel

        // no duplicates allowed
        const alreadySaved = favorites.find(function(f) {
            return f.userId === userId && f.itemId === itemId;
        });

        if (alreadySaved) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "this item is already in favorites", details: {} }
            });
        }

        const newFavorite = {
            id: favorites.length + 1,
            userId: userId,
            itemId: itemId,
            itemType: itemType
        };

        favorites.push(newFavorite);
        // next stage: save to MySQL

        return res.status(201).json({ success: true, data: { id: newFavorite.id }, error: null });
    } catch (err) {
        next(err);
    }
}

// DELETE - remove an item from favorites
function removeFavorite(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const index = favorites.findIndex(function(f) {
            return f.id === parseInt(id);
        });

        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "favorite " + id + " not found", details: {} }
            });
        }

        favorites.splice(index, 1);
        // next stage: delete from MySQL

        return res.status(200).json({ success: true, data: { id: parseInt(id) }, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getFavorites, addFavorite, removeFavorite };
