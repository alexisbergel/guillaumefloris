const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const multer = require('./middleware/multer-config');
const sharp = require('./middleware/sharp');
const rateLimiter = require('./middleware/rateLimiter');

const loginController = require('./controllers/login');
const portfolioController = require('./controllers/portfolio');
const dashboardController = require('./controllers/dashboard');
const profileController = require('./controllers/profile');
const signupController = require('./controllers/signup');


//* HOME PAGE
router.get('/', portfolioController.mainPage);
router.get('/about', portfolioController.aboutPage);
router.get('/contact', portfolioController.contactPage);
router.post('/contact', rateLimiter, portfolioController.sendMessage);


//* LOGIN
router.get('/login', loginController.mainPage);
router.post('/login', rateLimiter, loginController.login);
router.get('/logout', loginController.logout);


//* DASHBOARD
router.get('/dashboard', auth.authenticate, dashboardController.mainPage);
router.post('/post/new', auth.authenticate, multer.post, dashboardController.newPost);
router.patch('/post/:id(\\d+)/', auth.authenticate, multer.post, dashboardController.patchPost);
router.delete('/post/:id(\\d+)/', auth.authenticate, dashboardController.deletePost);


//* PROFILE
router.post('/profile', auth.authenticate, multer.profilePicture, sharp.resizeProfile, profileController.update);


//* SIGNUP
if (process.env.PRODUCTION !== 'true') {
    router.get('/signup', signupController.mainPage);
    router.post('/signup', rateLimiter, signupController.signup);
}


//* 404
router.use((req, res, next) => {
    return res.render('404');
});


//* ERROR HANDLING MIDDLEWARE
router.use((error, req, res, next) => {
    console.error(error);

    if (error.status === 404) {
        return res.render('404');
    }

    res.status(error.status || 500).json({
        message: error.details || 'An unexpected error occurred'
    });
});

module.exports = router;