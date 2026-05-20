function errorHandler(err, req, res, next) {
        
    console.error(err)
    if (err.message === "User not found") {
        return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: "Internal Server Error" })
}
module.exports = errorHandler;
