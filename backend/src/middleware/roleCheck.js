// takes a list of allowed roles (admin,manager) returns a middleware function
const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        // read the role from the request header
        const userRole = req.headers['x-user-role'];
        
        // if the role is missing or not in the allowed list, block the request
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                    details: {}
                }
            });
        }
        // if the role is valid - pass control to the next middleware or route handler
        next();
    };
};

module.exports = roleCheck;