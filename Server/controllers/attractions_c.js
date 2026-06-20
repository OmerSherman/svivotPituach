const attractionRepo = require('../repositories/attractionRepo');
const {
    parsePersonalizationContext,
    enrichAttraction
} = require('../utils/attractionScoring');

function parseJsonField(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (err) {
            return fallback;
        }
    }
    return value;
}

function normalizeAttraction(attraction) {
    if (!attraction) return attraction;

    return Object.assign({}, attraction, {
        tags: parseJsonField(attraction.tags, []),
        audience_scores: parseJsonField(attraction.audience_scores, {}),
        best_months: parseJsonField(attraction.best_months, []),
        avoid_months: parseJsonField(attraction.avoid_months, [])
    });
}

function enrichOne(attraction, context) {
    return enrichAttraction(normalizeAttraction(attraction), context);
}

async function getAll(req, res, next) {
    try {
        const results = await attractionRepo.findAll({
            type: req.query.type,
            cityId: req.query.city_id
        });
        const context = parsePersonalizationContext(req.query);

        res.status(200).json({
            success: true,
            data: results.map(function(attraction) {
                return enrichOne(attraction, context);
            }),
            error: null
        });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const attraction = await attractionRepo.findById(id);
        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        const context = parsePersonalizationContext(req.query);
        res.status(200).json({ success: true, data: enrichOne(attraction, context), error: null });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const { city_id, name, name_he, type, description_he } = req.body;

        const validTypes = ["site", "tour", "route"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "type must be one of: site, tour, route", details: { field: "type" } }
            });
        }

        const id = await attractionRepo.create({
            cityId: city_id,
            name: name,
            nameHE: name_he,
            type: type,
            descriptionHe: description_he,
            tags: req.body.tags,
            img_url: req.body.image_url,
            best_months: req.body.best_months,
            avoid_months: req.body.avoid_months,
            seasonal_note_he: req.body.seasonal_note_he,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        });

        const created = await attractionRepo.findById(id);
        res.status(201).json({
            success: true,
            data: enrichOne(created, null),
            error: null
        });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const attraction = await attractionRepo.findById(id);
        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        await attractionRepo.update(id, req.body);
        const updated = await attractionRepo.findById(id);

        res.status(200).json({
            success: true,
            data: enrichOne(updated, null),
            error: null
        });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "id must be a number", details: {} }
            });
        }

        const attraction = await attractionRepo.findById(id);
        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        await attractionRepo.delete(id);

        res.status(200).json({ success: true, data: { id: parseInt(id) }, error: null });
    } catch (err) {
        next(err);
    }
}

async function getMapData(req, res, next) {
    try {
        const city_id = req.query.city_id;

        if (!city_id) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "city_id is required", details: {} }
            });
        }

        const pins = await attractionRepo.findMapPins(city_id);
        res.status(200).json({ success: true, data: pins, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove, getMapData };
