const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: { type: String, default: null },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sneaker' }],
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sneaker' }],
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating',
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
