function errorHandler(err, req, res, next) {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    if (err.message === 'User not found') {
        return res.status(404).json({
            success: false,
            data: null,
            error: { code: 'NOT_FOUND', message: err.message, details: {} }
        });
    }

    res.status(500).json({
        success: false,
        data: null,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal Server Error',
            details: {}
        }
    });
}

module.exports = errorHandler;
