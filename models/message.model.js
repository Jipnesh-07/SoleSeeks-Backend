const mongoose = require("mongoose");
const Group = require("./group.model.js");

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "users",
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "groups",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    links: [
        {
            start: {
                type: Number
            },
            end: {
                type: Number
            },
            linkType: {
                type: String
            }
        }
    ],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "messages"
    }
}, {
    timestamps: true
});

messageSchema.pre("save", async (next) => {
    let data = await Group.findOne({ groupId: this.groupId, isDisabled: false });
    if(!data) next(new Error("Message cannot be sent"));
    next();
})

module.exports = mongoose.model("messages", messageSchema);
