const favorites = [];

// GET - all saved items for a specific user
function getFavorites(req, res) {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "userId is required",
                details: {}
            }
        });
    }

    const userFavorites = favorites.filter(function(f) {
        return f.userId === parseInt(userId);
    });

    return res.status(200).json({
        success: true,
        data: userFavorites,
        error: null
    });
}

// POST - save an item to the user's favorites list
function addFavorite(req, res) {
    const userId = req.body.userId;
    const itemId = req.body.itemId;
    const itemType = req.body.itemType; // attraction, restaurant, hotel

    // no duplicates allowed
    const alreadySaved = favorites.find(function(f) {
        return f.userId === userId && f.itemId === itemId;
    });

    if (alreadySaved) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "this item is already in favorites",
                details: {}
            }
        });
    }

    const newFavorite = {
        id: favorites.length + 1,
        userId: userId,
        itemId: itemId,
        itemType: itemType
    };

    favorites.push(newFavorite);
    //todo later: push on db 

    return res.status(201).json({
        success: true,
        data: { id: newFavorite.id },
        error: null
    });
}

// DELETE - remove an item from favorites
function removeFavorite(req, res) {
    const id = req.params.id;
    const index = favorites.findIndex(function(f) {
        return f.id === parseInt(id);
    });

    if (index === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "favorite " + id + " not found",
                details: {}
            }
        });
    }

    favorites.splice(index, 1);
    //todo later update db

    return res.status(200).json({
        success: true,
        data: { id: parseInt(id) },
        error: null
    });
}

module.exports = { getFavorites, addFavorite, removeFavorite };
