const Group = require("../models/group.model");

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ conversationMembers: req.user._id, isConversation: true });
        res.status(200).json({ groups });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
