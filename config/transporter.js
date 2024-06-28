const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_APP_FROM,
        pass: process.env.MAIL_APP_PASS
    }
});

module.exports = transporter