const AttractionORM = require('../ORM/AttractionORM');

async function getAll(req, res, next) {
    try {
        const results = await AttractionORM.findAll({
            type: req.query.type,
            cityId: req.query.city_id
        });
        res.status(200).json({ success: true, data: results, error: null });
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

        const attraction = await AttractionORM.findById(id);
        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        res.status(200).json({ success: true, data: attraction, error: null });
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

        const id = await AttractionORM.create({
            cityId: city_id,
            name,
            nameHE: name_he,
            type,
            descriptionHe: description_he,
            tags: req.body.tags,
            img_url: req.body.image_url,
            popularity_score: req.body.popularity_score,
            audience_scores: req.body.audience_scores,
            best_months: req.body.best_months,
            avoid_months: req.body.avoid_months,
            seasonal_note_he: req.body.seasonal_note_he,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        });

        res.status(201).json({ success: true, data: { id }, error: null });
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

        const attraction = await AttractionORM.findById(id);
        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        await AttractionORM.update(id, req.body);

        res.status(200).json({ success: true, data: { id: parseInt(id) }, error: null });
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

        const attraction = await AttractionORM.findById(id);
        if (!attraction) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "attraction " + id + " not found", details: {} }
            });
        }

        await AttractionORM.delete(id);

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

        const pins = await AttractionORM.findMapPins(city_id);
        res.status(200).json({ success: true, data: pins, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById, create, update, remove, getMapData };
