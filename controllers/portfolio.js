const mysql = require('../config/database');
const transporter = require('../config/transporter');
const userId = process.env.PRODUCTION === 'true' ? 1 : 13;



/* Functions */

// Returns an array with error message for each form input
const validateFields = (mail, message) => {
    const errors = [];

    if (mail.trim().length === 0) {
        errors.push({field: 'mail', message: 'Mail is missing'});
    }

    if (message.trim().length === 0) {
        errors.push({field: 'message', message: 'Message is missing'});
    }

    return errors;
}



/* Routes */

// Home
exports.mainPage = async (req, res, next) => {
    try {
        const userQuery = `SELECT cover_photo, description FROM user WHERE id = ?`;
        const postQuery = `SELECT post.*, tag.name as tagName FROM post LEFT JOIN tag ON post.tag_id = tag.id WHERE post.user_id = ? AND post.is_visible = 1 ORDER BY date DESC`;
        const tagQuery = `SELECT name FROM tag`;

        const [[userInfos], [posts], [tags]] = await Promise.all([
            mysql.execute(userQuery, [userId]),
            mysql.execute(postQuery, [userId]),
            mysql.execute(tagQuery)
        ]);

        // Checks if user exists in database (otherwise 404)
        if (userInfos.length === 0) {
            const error = new Error('user doesn\'t exist');
            error.status = 404;
            return next(error);
        }

        return res.render('portfolio', {userInfos:userInfos[0], content:posts, tags:tags});

    } catch (error) {
       return next(error);
    }
};

// About
exports.aboutPage = async (req, res, next) => {
    // Get user description and send it to the front
    try {
        const query = `SELECT description FROM user WHERE id = ?`;
        const [queryResult] = await mysql.execute(query, [userId]);

        // Checks if user exists in database (otherwise 404)
        if (queryResult.length === 0) {
            const error = new Error('user doesn\'t exist');
            error.status = 404;
            return next(error);
        }

        return res.render('about', {userInfos: queryResult[0]});

    } catch (error) {
        return next(error);
    }
};

// Contact 

exports.contactPage = async (req, res, next) => {
    // Get user description for description tag (SEO)
    try {
        const query = `SELECT description FROM user WHERE id = ?`;
        const [queryResult] = await mysql.execute(query, [userId]);

        // Checks if user exists in database (otherwise 404)
        if (queryResult.length === 0) {
            const error = new Error('user doesn\'t exist');
            error.status = 404;
            return next(error);
        }

        return res.render('contact', {userInfos: queryResult[0]});

    } catch(error) {
        next(error);
    }
};

exports.sendMessage = (req, res, next) => {
    const { mail, message } = req.body;

    // Checks data format
    if (typeof mail !== 'string' || typeof message !== 'string') {
        const error = new Error('Wrong data format');
        error.details = 'Le type de données n\'est pas pris en charge';
        error.status = 400;
        return next(error);
    }

    // Checks if data exists
    const validationErrors = validateFields(mail, message);

    if (validationErrors.length > 0) {
        const error = new Error('Empty mail or message');
        error.details = validationErrors;
        error.status = 400;
        return next(error);
    }

    const mailText = 'MAIL: ' + mail + '\n\n' + 'MESSAGE: ' + message;

    const mailOptions = {
        to: process.env.MAIL_APP_TO,
        subject: 'Message reçu depuis guillaumefloris.com',
        text: mailText
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return next(error);
        }

        return res.status(200).json({message: 'message sent'});
    })
};