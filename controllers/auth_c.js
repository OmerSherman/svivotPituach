const users = require('../models/mock_data/users.json');

// POST - create a new account
function register(req, res) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    // check email not already taken
    const emailTaken = users.find(function(u) {
        return u.email === email;
    });

    if (emailTaken) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "this email is already registered",
                details: {}
            }
        });
    }

    const newUser = {
        userId: users.length + 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        userRole: "user",
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
    };

    users.push(newUser);

    return res.status(201).json({
        success: true,
        data: { userId: newUser.userId },
        error: null
    });
}

// POST - login with existing account
function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    // find user by email and password
    const user = users.find(function(u) {
        return u.email === email && u.password === password;
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                code: "UNAUTHORIZED",
                message: "wrong email or password",
                details: {}
            }
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            userId: user.userId,
            firstName: user.firstName,
            userRole: user.userRole
        },
        error: null
    });
}

module.exports = { register, login };