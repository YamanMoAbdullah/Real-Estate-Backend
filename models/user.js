const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please enter the full name'],
        trim: true
    },
    userName: {
        type: String,
        required: [true, 'Please enter the userName'],
        unique: true,
        minlength: 1,
        maxlength: [50, "The userName must not exceed 50 characters."]
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
        required: false
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        required: false,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter the password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
    role: {
        type: String, 
        enum: ['user', 'admin'],
        default: 'user'
    },
    profilePicture: { 
        type: [String],
        default: null
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    fcmToken: {
        type: String
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcryptjs.genSalt();
    this.password = await bcryptjs.hash(this.password, salt);
    
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
