const express = require('express');
const Chat = require('../models/chat.model');
const User = require("../models/user.model");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const sendEmail = require('../utils/sendEmail');


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
        messages: [],
      });
    }

    // Check if either user has blocked the other
    if (chat.blockedUsers && (chat.blockedUsers.includes(senderId) || chat.blockedUsers.includes(participant))) {
      return res.status(403).json({ message: 'You cannot send a message to this user as you have been blocked by the user' });
    }

    // If chat exists, push the new message to the messages array
    chat.messages.push({
      sender: senderId,
      content,
      timestamp: new Date(),
    });
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


// Delete chat between two users
router.delete('/delete-chat/:participantId', authMiddleware, async (req, res) => {
  const { participantId } = req.params; // The user to delete the chat with
  const senderId = req.user._id; // Get sender's ID from JWT

  if (!participantId) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    // Find the chat between the sender and the participant
    const chat = await Chat.findOne({
      participants: { $all: [senderId, participantId] },
    });

    console.log('Chat Found:', chat);  // Debugging: Check if chat is found

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if the user is part of the chat (either sender or participant)
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this chat' });
    }

    // Delete the chat from the database using deleteOne
    await Chat.deleteOne({ _id: chat._id });

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Error:', err); // Debugging: Log the error
    res.status(500).json({ error: 'Failed to delete chat', details: err.message });
  }
});



// Flag a chat with a specific tag
router.post('/flag-chat', authMiddleware, async (req, res) => {
  const { participant, tag } = req.body; // Participant to flag the chat with and the tag
  const userId = req.user._id.toString(); // Current user (logged-in user), ensure it's a string
  const participantId = participant.toString(); // Ensure participant is also a string

  // Validate if participant and tag are provided
  if (!participant || !tag) {
    return res.status(400).json({ error: 'Participant and tag are required' });
  }

  // Edge Case 1: User cannot flag themselves
  if (userId === participantId) {
    return res.status(400).json({ error: 'You cannot flag your own chat' });
  }

  try {
    // Find the chat between the user and the participant
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    });

    // Edge Case 2: Check if the chat exists between the user and participant
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found between the user and participant' });
    }

    // Add the flag to the chat
    chat.flags.push({
      tag,
      addedBy: userId,
    });

    // Save the chat with the new flag
    await chat.save();

    res.status(200).json({ message: 'Chat flagged successfully', chat });
  } catch (err) {
    // Handle any errors that occur during the process
    console.error(err);
    res.status(500).json({ error: 'Failed to flag chat' });
  }
});




// Block a participant
router.post('/block-user', authMiddleware, async (req, res) => {
  const { participant } = req.body; // Participant to block
  const userId = req.user._id; // Current user (logged-in user)

  if (!participant) {
    return res.status(400).json({ error: 'Participant is required' });
  }

  try {
    // Find the chat between the user and the participant
    let chat = await Chat.findOne({
      participants: { $all: [userId, participant] },
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if the user is already blocked
    if (chat.blockedUsers.includes(participant)) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    // Add the participant to the blockedUsers list
    chat.blockedUsers.push(participant);

    await chat.save();

    res.status(200).json({ message: 'User blocked successfully', chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to block user' });
  }
});


// Unblock a participant
router.post('/unblock-user', authMiddleware, async (req, res) => {
  const { participant } = req.body; // Participant to unblock
  const userId = req.user._id; // Current user (logged-in user)

  if (!participant) {
    return res.status(400).json({ error: 'Participant is required' });
  }

  try {
    // Find the chat between the user and the participant
    let chat = await Chat.findOne({
      participants: { $all: [userId, participant] },
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Remove the participant from the blockedUsers list
    chat.blockedUsers = chat.blockedUsers.filter(
      (blockedUser) => blockedUser.toString() !== participant
    );

    await chat.save();

    res.status(200).json({ message: 'User unblocked successfully', chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

router.get('/blocked-users', authMiddleware, async (req, res) => {
  const userId = req.user._id; // Current user's ID from the authenticated token

  try {
    // Find all chats where the current user is a participant and has blocked others
    const chats = await Chat.find({
      participants: userId,
      blockedUsers: { $exists: true, $ne: [] }, // Ensure blockedUsers array is not empty
    }).populate('participants', 'name image'); // Populate participant info

    // Extract blocked users from chats
    const blockedUsers = [];
    chats.forEach((chat) => {
      chat.blockedUsers.forEach((blockedUserId) => {
        if (blockedUserId.toString() !== userId.toString()) {
          // Check if the blocked user is not the current user
          const blockedUser = chat.participants.find(
            (participant) => participant._id.toString() === blockedUserId.toString()
          );
          if (blockedUser) blockedUsers.push(blockedUser);
        }
      });
    });

    // Remove duplicates
    const uniqueBlockedUsers = Array.from(new Set(blockedUsers.map((user) => user._id.toString()))).map((id) =>
      blockedUsers.find((user) => user._id.toString() === id)
    );

    // Respond with the unique blocked users
    res.status(200).json({ blockedUsers: uniqueBlockedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});


module.exports = router;
