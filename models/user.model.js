const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: { type: String, default: "" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sneaker' }],
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sneaker' }],
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    leftCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating',
    }],
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
    isVerified: { type: Boolean, default: false }, // Email verification status
    resetPasswordToken: { type: String },          // Token for password reset
    resetPasswordExpires: { type: Date },          // Expiry for reset token
    warnings: { type: Number, default: 0 }, // New field for warnings
    isBlocked: {type: Boolean, default: false}, // new field to block users who are violatin app rules and regulations 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
