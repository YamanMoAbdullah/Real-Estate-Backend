const express = require('express');
const Property = require('../models/property');

module.exports.filter_properties = async (req, res) => {
    const {
        city,
        region,
        street,
        type,
        transactionType,
        minPrice,
        maxPrice
    } = req.query;

    try {
        let query = {};

        if (city) query['address.city'] = city;
        if (region) query['address.region'] = region;
        if (street) query['address.street'] = street;
        if (type) query.type = type;
        if (transactionType) query.transactionType = transactionType;

        if (minPrice && maxPrice) {
            query.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice) {
            query.price = { $gte: minPrice };
        } else if (maxPrice) {
            query.price = { $lte: maxPrice };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await Property.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        const properties = await Property.find(query).skip(skip).limit(limit);

        if (properties.length === 0) {
            return res.status(404).json({ message: 'No properties match the selected filters' });
        }

        res.status(200).json({
            message: 'Properties fetched successfully with filters',
            currentPage: page,
            totalPages: totalPages,
            totalCount: totalCount,
            properties: properties
        });

    } catch (err) {
        console.error('Error fetching properties with filters:', err);
        res.status(500).json({ message: 'Error fetching properties', error: err });
    }
};
