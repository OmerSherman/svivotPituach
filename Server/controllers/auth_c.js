const userRepo = require('../repositories/userRepo');

async function register(req, res, next) {
    try {
        const { firstName, lastName, email, password } = req.body;

        const existing = await userRepo.findByEmail(email);
        if (existing) {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "VALIDATION_ERROR", message: "this email is already registered", details: {} }
            });
        }

        const userId = await userRepo.create({ firstName, lastName, email, password, userRole: 'user' });

        return res.status(201).json({ success: true, data: { userId }, error: null });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await userRepo.findByEmailAndPassword(email, password);
        if (!user) {
            return res.status(401).json({
                success: false, data: null,
                error: { code: "UNAUTHORIZED", message: "wrong email or password", details: {} }
            });
        }

        return res.status(200).json({
            success: true,
            data: { userId: user.userId, firstName: user.firstName, userRole: user.userRole },
            error: null
        });
    } catch (err) {
        next(err);
    }
}

function logout(req, res, next) {
    return res.status(200).json({ success: true, data: { message: "logged out" }, error: null });
}

module.exports = { register, login, logout };
