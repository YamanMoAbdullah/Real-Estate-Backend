const express = require('express');
const filterRouter = express.Router();
const filterController = require('../controllers/filterController');

// search about properties depends on many things like address and price and type of transction
filterRouter.get('/properties/filter', filterController.filter_properties);

module.exports = filterRouter;
