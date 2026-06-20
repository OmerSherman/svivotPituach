const cityRepo = require('../repositories/cityRepo');

async function getAll(req, res, next) {
    try {
        const cities = await cityRepo.findAll();
        return res.status(200).json({ success: true, data: cities, error: null });
    } catch (err) {
        next(err);
    }
}

async function search(req, res, next) {
    try {
        const q = req.query.q;

        if (!q) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "search query is required", details: {} }
            });
        }

        const results = await cityRepo.search(q);
        return res.status(200).json({ success: true, data: results, error: null });
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

        const city = await cityRepo.findById(id);
        if (!city) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: "city " + id + " not found", details: {} }
            });
        }

        return res.status(200).json({ success: true, data: city, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, search, getById };
