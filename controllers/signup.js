const mysql = require('../config/database');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// Renders signup page
exports.mainPage = (req, res) => {
    // Shows the dashboard if the user is logged in
    if (req.cookies.token) return res.redirect('/dashboard');

    return res.render('signup');
};

// Signup route
exports.signup = async (req, res, next) => {
    let { username } = req.body;
    const { password, confirmedPassword } = req.body;
    username = username.toLowerCase();

    // Checks if user provides all required informations
    if (!username || !password || !confirmedPassword) {
        const error = new Error('Incomplete data while signing up');
        error.details = 'Tous les champs sont obligatoires';
        error.status = 400;
        return next(error);
    }

    // Checks data format
    if (typeof username !== 'string' || typeof password !== 'string' || typeof confirmedPassword !== 'string') {
        const error = new Error('Wrong data format');
        error.details = 'Tous les champs sont obligatoires';
        error.status = 400;
        return next(error);
    }

    // Checks if username is correct (no spaces, min. 2 char.)
    if (username.includes(' ') || username.trim().length < 2 || !/^[a-z0-9_]+$/.test(username)) {
        const error = new Error('Wrong username format');
        error.details = 'Le nom d\'utilisateur est incorrect';
        error.status = 400;
        return next(error);
    }

    // Checks if username is available
    try {
        const query = 'SELECT username FROM user WHERE username = ?';
        const [queryResult] = await mysql.execute(query, [username]);

        // If username already exists
        if (queryResult.length > 0) {
            const error = new Error('Username already exists');
            error.details = 'Le nom d\'utilisateur est déjà pris';
            error.status = 409;
            return next(error);
        }

    } catch (error) {
        return next(error);
    }

    // Checks if passwords match
    if (password !== confirmedPassword) {
        const error = new Error('Passwords do not match');
        error.details = 'Les mots de passe ne correspondent pas';
        error.status = 401;
        return next(error);
    }

    // Checks if password is correct (min. 6 char.)
    if (password.length < 6) {
        const error = new Error('Password is too short');
        error.details = 'Le mot de passe doit contenir minimum 6 caractères';
        error.status = 400;
        return next(error);
    }

    const hash = bcrypt.hashSync(password, 10);

    try {
        const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
        const [queryResult] = await mysql.execute(query, [username, hash]);

        if (queryResult.affectedRows === 0) {
            const error = new Error('Error while inserting new user into the user table');
            error.details = 'Une erreur est survenue. Veuillez réessayer plus tard.';
            return next(error);
        }

        const userId = queryResult.insertId;

        const token = auth.authToken({userId: userId});
        res.cookie('token', token, {
            maxAge: process.env.SESSION_DURATION, 
            httpOnly: true,
            secure: process.env.PRODUCTION === 'true',
            sameSite: process.env.PRODUCTION === 'true' ? 'lax' : 'none'
        });

        return res.status(200).json({redirect:'/dashboard'});

    } catch (error) {
        return next(error);
    }
};