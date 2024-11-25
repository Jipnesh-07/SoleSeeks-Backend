const Group = require("../models/group.model"); // Ensure this import is correct
const Message = require("../models/message.model");

exports.createMessage = async (req, res) => {
    try {
        const { recipientId, message } = req.body;

        // Check if a conversation group already exists between the sender and recipient
        let group = await Group.findOne({
            conversationMembers: { $all: [req.user._id, recipientId] },
            isConversation: true
        });

        // If no group exists, create one with isConversation set to true
        if (!group) {
            group = await Group.create({
                conversationMembers: [req.user._id, recipientId],
                isConversation: true
            });
        }

        // Create the message and link it to the group
        const newMessage = await Message.create({
            groupId: group._id,
            userId: req.user._id,
            message
        });

        return res.status(200).json({ message: newMessage });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};


exports.getMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId }).sort({ createdAt: -1 }).limit(50);

        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
