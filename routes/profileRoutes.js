const express = require('express');
const profileRouter = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

profileRouter.get('/Profile', auth, profileController.get_profile);
profileRouter.post('/add-to-favorites/:id', auth, profileController.post_addToFavorites);
profileRouter.get('/favorites', auth, profileController.get_favorites);
profileRouter.delete('/remove-from-favorites/:id', auth, profileController.delete_remove_from_favorites);

module.exports = profileRouter;
