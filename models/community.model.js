const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: String,
    description: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

module.exports = mongoose.model('Community', CommunitySchema);

