function errorHandler(err, req, res, next) {
    console.error(err.message);
    res.status(500).json({
        success: false,
        data: null,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: err.message || "something went wrong",
            details: {}
        }
    });
}

module.exports = errorHandler;
