const express = require('express');
const Property = require('../models/property');
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/user');
const sendNotification = require('../utils/sendNotification');

// Error handling function for property validation errors
const handleErrors = (err) => {
    let errors = {
        type: '',
        transactionType: '',
        address: '',
        area: '',
        rooms: '',
        bedRooms: '',
        livingRooms: '',
        kitchens: '',
        floor: '',
        floors: '',
        legalState: '',
        description: '',
        direction: '',
        price: '',
        images: ''
    }

    // Check for validation errors in property fields and return custom error messages
    if (err.message.includes('Property validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            if (properties.path.includes('.')) {
                errors['address'] = properties.message;
            } else {
                errors[properties.path] = properties.message;
            }
        });
    }
    return errors;
};

// Endpoint to fetch all properties with pagination
module.exports.get_properties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Get current page from query params (default: 1)
        const limit = parseInt(req.query.limit) || 10;  // Get the number of results per page (default: 10)

        // Calculate total number of properties and pages
        const totalCount = await Property.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
         // Calculate number of documents to skip for pagination
        const skip = (page - 1) * limit; 
        // Fetch properties for the current page
        const properties = await Property.find().skip(skip).limit(limit);  

        if (!properties || properties.length === 0) {
            return res.status(404).json({ message: 'There are no properties' });
        }

        res.status(200).json({
            message: 'Properties fetched successfully',
            currentPage: page,
            totalPages,
            totalCount,
            properties
        });
    } catch (err) {
        console.error('Error fetching properties:', err);  // Log error for debugging
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Endpoint to add a new property
module.exports.add_property = async (req, res) => {
    try {
        const propertyData = req.body;  
        const newProperty = new Property(propertyData);  
        const savedProperty = await newProperty.save();  
        const propertyId = savedProperty._id.toString();
        const baseUrl = `${req.protocol}://${req.get('host')}`; 

        // Check if there are compressed image files in the request and handle them
        if (req.compressedImagePaths && req.compressedImagePaths.length > 0) {
            const imagePaths = [];
            const propertyDir = path.join('uploads', 'imagesProperty');  // Directory to store property images
            await fs.mkdir(propertyDir, { recursive: true });  // Create the directory if it doesn't exist

            // Loop through the compressed image paths, rename them, and store them
            for (const tempPath of req.compressedImagePaths) {
                const newFileName = `${propertyId}-image-${Date.now()}.webp`;  
                const newPath = path.join(propertyDir, newFileName);
                await fs.rename(tempPath, newPath); 
                const fullImageUrl = `${baseUrl}/uploads/imagesProperty/${newFileName}`;  
                imagePaths.push(fullImageUrl);  
            }

            savedProperty.images = imagePaths; 
            await savedProperty.save();  
        }

        const tempDir = path.join('uploads', 'temp');
         // Clean up temporary directory
        await fs.rm(tempDir, { recursive: true, force: true }); 

        // Send push notifications to users who have subscribed to FCM
        const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
        for (let user of users) {
            await sendNotification(user.fcmToken, "New Property!", "A new property has been added. Check it out now.");
        }

        res.status(201).json({
            message: 'Property added successfully',
            property: savedProperty
        });
    } catch (err) {
        console.log(err);
        const errors = handleErrors(err);  
        res.status(500).json({ errors });
    }
};

// Endpoint to fetch a single property by its ID
module.exports.get_property = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await Property.findById(propertyId); 

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const propertyObj = property.toObject();  
        res.status(200).json({
            message: 'Property fetched successfully',
            property: propertyObj  
        });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Endpoint to delete a property by its ID
module.exports.delete_property = async (req, res) => {
    try {
        let propertyId = req.params.id; 

        const property = await Property.findById(propertyId); 
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Delete associated images from the file system
        if (property.images && property.images.length > 0) {
            for (const imagePath of property.images) {
                try {
                    await fs.unlink(imagePath); 
                } catch (err) {
                    console.error(err.message);  
                }
            }
        }

        // Delete the property from the database
        await Property.findByIdAndDelete(propertyId);

        res.status(200).json({
            message: 'Property deleted successfully',
            deletedPropertyId: propertyId  
        });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Endpoint to update an existing property
module.exports.update_property = async (req, res) => {
    try {
        let propertyId = req.params.id; 
        const property = await Property.findById(propertyId);  

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const updatedData = req.body;  
        Object.assign(property, updatedData);  

        const baseUrl = `${req.protocol}://${req.get('host')}`;  
        // Check if there are new images in the request and handle them
        if (req.compressedImagePaths && req.compressedImagePaths.length > 0) {
            // Delete old images if they exist
            if (property.images && property.images.length > 0) {
                for (const oldImagePath of property.images) {
                    try {
                        const imagePathToDelete = oldImagePath.replace(baseUrl, '');
                        const fullImagePath = path.join(__dirname, '..', imagePathToDelete);
                        await fs.unlink(fullImagePath);  // Delete old image files
                    } catch (err) {
                        console.error(err.message);  // Log errors related to file deletion
                    }
                }
            }

            const imagePaths = [];
            const propertyDir = path.join('uploads', 'imagesProperty');
            await fs.mkdir(propertyDir, { recursive: true });  // Create directory for new images

            // Process new images
            for (const tempPath of req.compressedImagePaths) {
                const newFileName = `${propertyId}-image-${Date.now()}.webp`;
                const newPath = path.join(propertyDir, newFileName);
                await fs.rename(tempPath, newPath); 
                const fullImageUrl = `${baseUrl}/uploads/imagesProperty/${newFileName}`; 
                imagePaths.push(fullImageUrl); 
            }

            property.images = imagePaths;  
        }

        const tempDir = path.join('uploads', 'temp');
        await fs.rm(tempDir, { recursive: true, force: true }); 

        // Save the updated property to the database
        const updatedProperty = await property.save();
        res.status(200).json({
            message: 'Property updated successfully',
            property: updatedProperty  
        });
    } catch (err) {
        console.log(err); 
        const errors = handleErrors(err);  
        res.status(500).json({ errors });
    }
};
