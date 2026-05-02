const logger = (req, res, next) => {    
    // record the time the request arrived
    const start = Date.now();
    

    // fires after the response is sent to the client so we can log the final status code and how long it took
    res.on('finish', () => {
        const duration = Date.now() - start;

        // log format exemple: [2024-11-01T10:23:01.000Z] method:GET path:/api/recommendations status:200 duration:12ms
        console.log(`[${new Date().toISOString()}] method:${req.method} path:${req.url} status:${res.statusCode} duration:${duration}ms`);
    });

    // pass control to the next middleware or route handler
    next();
};

module.exports = logger;