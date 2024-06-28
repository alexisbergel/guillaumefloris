const jwt = require('jsonwebtoken');

exports.authToken = (userId) => {
    // Return the token to create the cookie (login || signup)
    return jwt.sign(userId, process.env.TOKEN_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.authenticate = (req, res, next) => {
    // The token is created when the user authenticates (login || signup)
    const token = req.cookies.token;

    // If there is no token, redirect to login page
    if (!token) {
        return res.redirect('/login')
    }

    // If a token exists, checks if it is available
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.userId = decoded.userId;
        next();

    } catch(error) {
        res.clearCookie('token').redirect('/login');
    }
}
