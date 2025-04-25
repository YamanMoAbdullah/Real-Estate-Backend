const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// This middleware to compress the images before save them 
const compressImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next();
        }

        const imagePaths = [];
        // This folder for save the images in it temporally
        const propertyDir = path.join('uploads', 'temp');
        // if the temp folder not found create it
        await fs.mkdir(propertyDir, { recursive: true });

        for (const file of req.files) {
            const oldPath = file.path;
            const tempFileName = `temp-image-${Date.now()}.webp`;
            const newPath = path.join(propertyDir, tempFileName);

            // Compress the images using sharp
            await sharp(oldPath)
                .resize({
                    width: 800,
                    height: 600,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 70 })
                .toFile(newPath);

            await fs.unlink(oldPath);
            imagePaths.push(newPath);
        }

        req.compressedImagePaths = imagePaths;
        next();
    } catch (err) {
        console.error('Error in compressImages middleware:', err.message);
        res.status(500).json({ message: 'Error processing images' });
    }
};

module.exports = compressImages;
