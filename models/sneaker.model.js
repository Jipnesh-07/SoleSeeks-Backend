const mongoose = require('mongoose');

const SneakerSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    condition: { type: String, enum: ['good', 'better', 'best'] },
    image: String,
    usdzFile: String,
    size: Number,
    brand: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inBidding: { type: Boolean, default: false },
    sold: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Sneaker', SneakerSchema);
