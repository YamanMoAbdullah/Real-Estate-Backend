const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const propertySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["house", "apartment", "villa", "shop"],
        required: [true, 'Please enter the type of your property'],
    },
    transactionType: {
        type: String,
        enum: ["sale", "rent"],
        required: [true, 'Please choose the transaction type']
    },
    address: {
        city: {
            type: String,
            required: [true, 'Please enter the city of property']
        },
        region: {
            type: String,
            required: [true, 'Please enter the region of property']
        },
        street: String
    },
    area: {
        type: Number, 
        required: [true, 'Please enter the area of property']
    },
    rooms: {
        type: Number,
        required: function () {
            return this.type !== "shop";
        },
        message: 'The number of rooms is required for property types other than "shop".'
    },
    bedRooms: {
        type: Number,
        required: function () {
            return this.type !== "shop";
        },
        message: 'The number of bedrooms is required for property types other than "shop".'
    },
    livingRooms: {
        type: Number,
        required: function () {
            return this.type !== "shop";
        },
        message: 'The number of living rooms is required for property types other than "shop".'
    },
    kitchens: {
        type: Number,
        required: [function () {
            return this.type !== "shop";
        },
        'The number of kitchens is required for property types other than "shop".']
    },
    floor: {
        type: Number,
        required: function () {
            return this.type === "apartment";
        },
        message: 'Floor number is required for apartments.'
    },
    floors: { 
        type: Number,
        required: function () {
            return this.type === "villa";
        },
        message: 'Number of floors is required for villas.'
    },
    legalState: {
        type: String,
        required: [true, 'Please enter the legal state']
    },
    description: String,
    direction: String,
    price: {
        type: Number,
        required: [true, 'Please enter the price of property']
    },
    images: [
        {
            type: String
        }
    ]
});

propertySchema.index({ type: 1, transactionType: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
