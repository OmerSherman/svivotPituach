const countryRepo = require('../repositories/countryRepo');

async function getAll(req, res, next) {
    try {
        const countries = await countryRepo.findAll();
        return res.status(200).json({ success: true, data: countries, error: null });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const id = req.params.id;

        if (isNaN(parseInt(id, 10))) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: 'VALIDATION_ERROR', message: 'id must be a number', details: {} }
            });
        }

        const country = await countryRepo.findById(id);
        if (!country) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: 'NOT_FOUND', message: 'country ' + id + ' not found', details: {} }
            });
        }

        return res.status(200).json({ success: true, data: country, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getById };
