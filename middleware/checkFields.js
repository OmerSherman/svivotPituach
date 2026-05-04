const checkRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];

        requiredFields.forEach(field => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: "VALIDATION_ERROR", message: "please fill in all fields", details: {} }
            });
        }

        next();
    };
};

module.exports = checkRequiredFields;