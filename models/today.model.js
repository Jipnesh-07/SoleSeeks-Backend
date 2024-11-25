const mongoose = require('mongoose');

const todaySchema = new mongoose.Schema({
    artwork: { type: String, required: true }, // Sneaker image
    platformTitle: { type: String, required: true },
    bannerTitle: { type: String, required: true },
    sneaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Sneaker', required: true }, // Reference to Sneaker model
}, { timestamps: true });

module.exports = mongoose.model('Today', todaySchema);
