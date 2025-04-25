const express = require('express');
const User = require('../models/user');
const Property = require('../models/property');

module.exports.get_profile = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser){
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            fullName: currentUser.fullName,
            userName: currentUser.userName,
            phoneNumber: currentUser.phoneNumber,
            email: currentUser.email,
            profilePicture: currentUser.profilePicture,
            role: currentUser.role
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// This function to add the favorites properties for user to his profile
module.exports.post_addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params.id;

        if (!propertyId) {
            return res.status(400).json({ message: 'Property ID is required' });
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.Favorites.includes(propertyId)) {
            currentUser.Favorites.push(propertyId);
            await currentUser.save();
        }

        res.status(200).json({
            message: 'Property added to favorites',
            Favorites: currentUser.Favorites
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Error adding to favorites', error: err.message });
    }
};

module.exports.get_favorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId).populate('favorites');
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Favorites retrieved successfully',
            favorites: currentUser.favorites
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Error retrieving favorites', error: err.message });
    }
};

module.exports.delete_remove_from_favorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params.id;

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const index = currentUser.favorites.indexOf(propertyId);
        if (index === -1) {
            return res.status(404).json({ message: 'Property not found in favorites' });
        }

        currentUser.favorites.splice(index, 1);
        await currentUser.save();

        res.status(200).json({ message: 'Property removed from favorites successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing property from favorites', error: err.message });
    }
};
