const attractions = require('../models/mock_data/attractions.json');

// helper to find attraction by id
function findById(id) {
    return attractions.find(function(attraction) {
        return attraction.id === parseInt(id);
    });
}

// GET - all attractions, with optional filters by type or city
function getAll(req, res) {
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

    res.status(200).json({
        success: true,
        data: result,
        error: null
    });
}

// GET - one attraction by id
function getById(req, res) {
    const id = req.params.id;
    const attraction = findById(id);

    if (!attraction) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "attraction " + id + " not found",
                details: {}
            }
        });
    }

    res.status(200).json({ success: true, data: attraction, error: null });
}

// POST - create a new attraction
function create(req, res) {
    const city_id = req.body.city_id;
    const name = req.body.name;
    const name_he = req.body.name_he;
    const type = req.body.type;
    const description_he = req.body.description_he;

    if (!city_id || !name || !name_he || !type || !description_he) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "missing required fields",
                details: { required: ["city_id", "name", "name_he", "type", "description_he"] }
            }
        });
    }

    // make sure type is one of the valid options
    const validTypes = ["site", "tour", "route"];
    if (!validTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "type must be one of: site, tour, route",
                details: { field: "type" }
            }
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
        popularity_score: req.body.popularity_score || 0,
        audience_scores: req.body.audience_scores || {},
        best_months: req.body.best_months || []
    };

    attractions.push(newAttraction);
    res.status(201).json({ success: true, data: { id: newAttraction.id }, error: null });
}

// PUT - update an existing attraction (only the fields that were sent)
function update(req, res) {
    const id = req.params.id;
    const attraction = findById(id);

    if (!attraction) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "attraction " + id + " not found",
                details: {}
            }
        });
    }

    const allowedFields = ["name", "name_he", "type", "description_he", "tags", "image_url", "popularity_score", "audience_scores", "best_months"];

    for (let i = 0; i < allowedFields.length; i++) {
        const field = allowedFields[i];
        if (req.body[field] !== undefined) {
            attraction[field] = req.body[field];
        }
    }

    res.status(200).json({ success: true, data: { id: parseInt(id) }, error: null });
}

// DELETE - remove an attraction
function remove(req, res) {
    const id = req.params.id;
    const index = attractions.findIndex(function(attraction) {
        return attraction.id === parseInt(id);
    });

    if (index === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "attraction " + id + " not found",
                details: {}
            }
        });
    }

    attractions.splice(index, 1);
    res.status(200).json({ success: true, data: { id: parseInt(id) }, error: null });
}

// GET - map pins for a city, returns only the fields needed for the map
function getMapData(req, res) {
    const city_id = req.query.city_id;

    if (!city_id) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "city_id is required",
                details: {}
            }
        });
    }

    const pins = attractions
        .filter(function(a) {
            return a.city_id === parseInt(city_id);
        })
        .map(function(a) {
            return {
                id: a.id,
                name_he: a.name_he,
                type: a.type,
                latitude: a.latitude,
                longitude: a.longitude
            };
        });

    return res.status(200).json({
        success: true,
        data: pins,
        error: null
    });
}

module.exports = { getAll, getById, create, update, remove, getMapData };
