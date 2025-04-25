const express = require('express');
const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// This function to generate access and refresh tokens for the use
const createTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.secret, {
        expiresIn: '1h'
    });

    const refreshToken = jwt.sign({ id }, process.env.refreshSecret, {
        expiresIn: '30d'
    });

    return { accessToken, refreshToken };
};

// Function to refresh the access token using the refresh token
const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.refreshSecret);
        const accessToken = jwt.sign({ id: decoded.id }, process.env.secret, {
            expiresIn: '1h'
        });

        return { accessToken };
    } catch (err) {
        throw new Error('Invalid refresh token');
    }
};

const handleErrors = (err) => {
    let errors = { fullName: '', userName: '', phone: '', email: '', password: '' };

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        errors[field] = `This ${field} is already in use, Please choose a different one`;
        return errors;
    }

    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            if (properties && properties.path) {
                errors[properties.path] = properties.message;
            }
        });
    }

    return errors;
};

const validateSyrianPhone = (phoneNumber) => {
    const regex = /^09\d{8}$/;
    return regex.test(phoneNumber);
};

module.exports.signup_post = async (req, res) => {
    try {
        const { fullName, userName, phoneNumber, email, password, fcmToken } = req.body;

        if (!email && !phoneNumber) {
            return res.status(400).json({ message: 'please Enter email or phone' });
        }

        if (phoneNumber && !validateSyrianPhone(phoneNumber)) {
            return res.status(400).json({ message: 'Please Enter a valid phone number' });
        }

        const currEmail = email && email.trim() !== "" ? email : undefined;
        const currPhone = phoneNumber && phoneNumber.trim() !== "" ? phoneNumber : undefined;

        const newUser = await User.create({ fullName, userName, phoneNumber: currPhone, email: currEmail, password });

        // This token for sent notification for the user 
        if (fcmToken) {
            newUser.fcmToken = fcmToken;
            await newUser.save();
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        if (req.compressedImagePaths && req.compressedImagePaths.length > 0) {
            const userImageDir = path.join('uploads', 'imagesUser');
            await fs.mkdir(userImageDir, { recursive: true });

            const imagePaths = [];
            for (const tempFilePath of req.compressedImagePaths) {
                const newFileName = `${newUser._id}-image-${Date.now()}.webp`;
                const newFilePath = path.join(userImageDir, newFileName);
                await fs.rename(tempFilePath, newFilePath);
                const fullImageUrl = `${baseUrl}/uploads/imagesUser/${newFileName}`;
                imagePaths.push(fullImageUrl);
            }

            newUser.profilePicture = imagePaths;
            await newUser.save();
        }

        const { accessToken, refreshToken } = createTokens(newUser._id);
        
        // Store refresh token in a secure HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        const tempDir = path.join('uploads', 'temp');
        await fs.rm(tempDir, { recursive: true, force: true });

        res.status(201).json({ accessToken, message: 'User created!', id: newUser._id });
    } catch (err) {
        console.log(err);
        const errors = handleErrors(err);
        res.status(500).json({ errors });
    }
};

module.exports.login_post = async (req, res) => {
    const { email, phoneNumber, password, fcmToken } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ message: 'please Enter email or phone' });
    }

    try {
        const searchQuery = [];
        if (email) searchQuery.push({ email });
        if (phoneNumber) searchQuery.push({ phoneNumber });

        const foundUser = await User.findOne({
            $or: searchQuery.length > 0 ? searchQuery : [{}]
        });

        if (phoneNumber && !validateSyrianPhone(phoneNumber)) {
            return res.status(400).json({ message: 'Please Enter a valid phone number' });
        }

        if (!foundUser) {
            return res.status(401).json({ message: 'invalid email or password' });
        }

        const isValidPassword = await bcryptjs.compare(password, foundUser.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'invalid email or password' });
        }

        const { accessToken, refreshToken } = createTokens(foundUser._id);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        if (fcmToken) {
            foundUser.fcmToken = fcmToken;
            await foundUser.save();
        }

        res.status(200).json({ accessToken, message: 'Login successful', id: foundUser._id });
    } catch (err) {
        console.log(err);
        res.status(500).json({});
    }
};

module.exports.refresh_token = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const { accessToken } = refreshAccessToken(refreshToken);
        return res.json({ accessToken });
    } catch (err) {
        return res.status(401).json({
            message: 'Refresh token is invalid or expired. Please log in again.'
        });
    }
};

module.exports.logout_post = async (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true });
    res.status(200).json({ message: 'Logged out successfully' });
};
