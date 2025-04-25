const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');
const compressImages = require('../middleware/compressImages');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Before register the user will compress the profile image 
authRouter.post('/signup', upload, compressImages, authController.signup_post);
authRouter.post('/login', authController.login_post);
// check if refresh token is found then generate a new access token for this user where acces token for 1 hour and refresh token for 30 days
authRouter.post('/refresh-token', auth, authController.refresh_token);
authRouter.post('/logout', auth, authController.logout_post);

module.exports = authRouter;
