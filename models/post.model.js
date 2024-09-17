const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    content: String,
    image: String,
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
