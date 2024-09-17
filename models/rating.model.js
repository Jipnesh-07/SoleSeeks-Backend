const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }, // Scale 1-5
    review: String,
}, { timestamps: true });

module.exports = mongoose.model('Rating', RatingSchema);
