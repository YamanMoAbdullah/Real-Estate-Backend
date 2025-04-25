const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// This is engine to upload files in temp folder
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const tempDir = path.join('uploads', 'temp');
        try {
            await fs.mkdir(tempDir, { recursive: true });
            cb(null, tempDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// check if the images are avaliable types
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'));
    }
};


// Configure multer to limit file size to 10MB and accept up to 20 images
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
}).array('images', 20);

module.exports = upload;
