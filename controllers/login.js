const mysql = require('../config/database');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// Renders main login page
exports.mainPage = (req, res) => {
    // Shows the dashboard if the user is logged in
    if (req.cookies.token) return res.redirect('/dashboard');

    return res.render('login');
};



// Login & logout

exports.login = async (req, res, next) => {
    const username = req.body.username ? req.body.username.toLowerCase() : null;
    const password = req.body.password;
    const genericError = 'Nom d\'utilisateur ou mot de passe incorrect';

    // Checks if user provides all required informations
    if (!username || !password) {
        const error = new Error('Incomplete data while signing up');
        error.details = 'Tous les champs sont obligatoires';
        error.status = 400;
        return next(error);
    }

    // Checks data format 
    if (typeof username !== 'string' || typeof password !== 'string') {
        const error = new Error('Wrong data format');
        error.details = 'Tous les champs sont obligatoires';
        error.status = 400;
        return next(error);
    }

    // Checks length
    if (username.trim().length === 0 || password.trim().length === 0) {
        const error = new Error('Empty username or password');
        error.details = 'Tous les champs sont obligatoires';
        error.status = 400;
        return next(error);
    }

    try {
        const query = 'SELECT id, password FROM user WHERE username = ?';
        const [queryResult] = await mysql.execute(query, [username]);

        if (queryResult.length === 0) {
            const error = new Error('No user found with the username provided at login.');
            error.details = genericError;
            error.status = 400;
            return next(error);
        }
        
        const userId = queryResult[0].id;
        const hash = queryResult[0].password;
        const matchingPasswords = bcrypt.compareSync(password, hash);

        if (!matchingPasswords) {
            const error = new Error('Passwords do not match');
            error.details = genericError;
            error.status = 400;
            return next(error);
        }

        const token = auth.authToken({userId: userId});
        res.cookie('token', token, {
            maxAge: process.env.SESSION_DURATION, 
            httpOnly: true,
            secure: process.env.PRODUCTION === 'true',
            sameSite: process.env.PRODUCTION === 'true' ? 'lax' : 'none'
        });

        res.status(200).json({redirect:'/dashboard'});

    } catch (error) {
        next(error);
    }
}

exports.logout = (req, res) => {
    return res.clearCookie('token').status(200).redirect('/');
};