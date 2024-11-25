const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: function() {
            return !this.isConversation;
        },
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: function() {
            return !this.isConversation;
        }
    },
    imageUrl: {
        type: String,
    },
    imageId: {
        type: String,
    },
    isConversation: {
        type: Boolean,
        default: false
    },
    conversationMembers: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    participants: {
        type: Number,
        default: 1
    },
    isDisabled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('groups', groupSchema);
