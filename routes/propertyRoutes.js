const express = require('express');
const propertyRouter = express.Router();
const propertyController = require('../controllers/propertyController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const compressImages = require('../middleware/compressImages');
const isAdmin = require('../middleware/isAdmin');

// This route is open for all users
propertyRouter.get('/properties', propertyController.get_properties);
// add a new property if the user authintecated 
// before add A new property comprss the images for this property
propertyRouter.post('/add-property', auth, upload, compressImages, propertyController.add_property);
propertyRouter.get('/get-property/:id', auth, propertyController.get_property);
// The two next routes are open for admins 
propertyRouter.delete('/delete-property/:id', auth, isAdmin, propertyController.delete_property);
propertyRouter.put('/update-property/:id', auth, isAdmin, upload, compressImages, propertyController.update_property);

module.exports = propertyRouter;
