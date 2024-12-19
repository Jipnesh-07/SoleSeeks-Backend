const express = require('express');
const Chat = require('../models/chat.model');
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");


// Post message or create a new chat
router.post('/message', authMiddleware, async (req, res) => {
  const { participant, content } = req.body;  // participants should be an array with at least two users
  const senderId = req.user._id;  // Get sender's ID from JWT

  if (!participant || !content) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    // Check if a chat already exists between the sender and participants
    let chat = await Chat.findOne({
      participants: { $all: [senderId, participant] },
    });

    if (!chat) {
      // If the chat doesn't exist, create a new chat
      chat = new Chat({
        participants: [senderId, participant],
        messages: [
          {
            sender: senderId,
            content,
            timestamp: new Date(),
          },
        ],
      });
    } else {
      // If chat exists, push the new message to the messages array
      chat.messages.push({
        sender: senderId,
        content,
        timestamp: new Date(),
      });
    }

    // Save the chat to the database
    await chat.save();

    res.status(200).json({ success: true, message: 'Message sent successfully', chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});


// Post message or create a new chat
router.post('/new-chat', authMiddleware, async (req, res) => {
  const { participant } = req.body;  // participants should be an array with at least two users
  const senderId = req.user._id;  // Get sender's ID from JWT

  if (!participant) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  if (participant === senderId) {
    return;
  }

  try {
    // Check if a chat already exists between the sender and participants
    let chat = await Chat.findOne({
      participants: { $all: [senderId, participant] },
    });

    if (!chat) {
      // If the chat doesn't exist, create a new chat
      chat = new Chat({
        participants: [senderId, participant],
        messages: [],
      });
    } 

    // Save the chat to the database
    await chat.save();

    res.status(200).json({ success: true, message: 'Chats fetched successfully', roomName: chat._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Get recent chats
router.get('/recent/', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name image')
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to fetch recent chats' });
  }
});


module.exports = router;
