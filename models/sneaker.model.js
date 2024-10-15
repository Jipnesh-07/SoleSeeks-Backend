const mongoose = require('mongoose');

const SneakerSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    brand: String,
    image: [String],
    usdzFile: String,
    size: String,
    condition: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    // Other fields as needed
});

const Sneaker = mongoose.model('Sneaker', SneakerSchema);
module.exports = Sneaker;
