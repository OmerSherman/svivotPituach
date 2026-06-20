const attractions = require('../models/mock_data/attractions.json');
const {
    parsePersonalizationContext,
    enrichAttraction
} = require('../utils/attractionScoring');

// helper to find attraction by id
function findById(id) {
    return attractions.find(function(attraction) {
        return attraction.id === parseInt(id);
    });
}

// GET - all attractions, with optional filters by type or city
function getAll(req, res, next) {
    try {
        const type = req.query.type;
        const city_id = req.query.city_id;
        let result = attractions;

        if (type) {
            result = result.filter(function(attraction) {
                return attraction.type === type;
            });
        }

        if (city_id) {
            result = result.filter(function(attraction) {
                return attraction.city_id === parseInt(city_id);
            });
        }

        var context = parsePersonalizationContext(req.query);
        result = result.map(function(attraction) {
            return enrichAttraction(attraction, context);
        });

        res.status(200).json({ success: true, data: result, error: null });
    } catch (err) {
        next(err);
    }
}

// GET - one attraction by id
function getById(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const attraction = findById(id);

        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        var context = parsePersonalizationContext(req.query);
        res.status(200).json({ success: true, data: enrichAttraction(attraction, context), error: null });
    } catch (err) {
        next(err);
    }
}

// POST - create a new attraction
function create(req, res, next) {
    try {
        const { city_id, name, name_he, type, description_he } = req.body;

        // type must be one of the valid options
        const validTypes = ["site", "tour", "route"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "type must be one of: site, tour, route", details: { field: "type" } }
            });
        }

        const newAttraction = {
            id: attractions.length + 1,
            city_id: city_id,
            name: name,
            name_he: name_he,
            type: type,
            description_he: description_he,
            tags: req.body.tags || [],
            image_url: req.body.image_url || null,
            best_months: req.body.best_months || [],
            avoid_months: req.body.avoid_months || [],
            seasonal_note_he: req.body.seasonal_note_he || null
        };

        attractions.push(newAttraction);
        res.status(201).json({
            success: true,
            data: enrichAttraction(newAttraction, null),
            error: null
        });
    } catch (err) {
        next(err);
    }
}

// PUT - update an existing attraction (only the fields that were sent)
function update(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const attraction = findById(id);

        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        const allowedFields = [
            "name", "name_he", "type", "description_he", "tags", "image_url",
            "best_months", "avoid_months", "seasonal_note_he"
        ];

        for (let i = 0; i < allowedFields.length; i++) {
            const field = allowedFields[i];
            if (req.body[field] !== undefined) {
                attraction[field] = req.body[field];
            }
        }

        res.status(200).json({
            success: true,
            data: enrichAttraction(attraction, null),
            error: null
        });
    } catch (err) {
        next(err);
    }
}

// DELETE - remove an attraction
function remove(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const index = attractions.findIndex(function(attraction) {
            return attraction.id === parseInt(id);
        });

        if (index === -1) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        attractions.splice(index, 1);
        res.status(200).json({ success: true, data: { id: parseInt(id) }, error: null });
    } catch (err) {
        next(err);
    }
}

// GET - map pins for a city, returns only the fields needed for the map
function getMapData(req, res, next) {
    try {
        const city_id = req.query.city_id;

        if (!city_id) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "city_id is required", details: {} }
            });
        }

        const pins = attractions
            .filter(function(a) { return a.city_id === parseInt(city_id); })
            .map(function(a) {
                return { id: a.id, name_he: a.name_he, type: a.type, latitude: a.latitude, longitude: a.longitude };
            });

        res.status(200).json({ success: true, data: pins, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove, getMapData };
