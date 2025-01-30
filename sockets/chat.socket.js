const Chat = require("../models/chat.model");
const User = require("../models/user.model");

module.exports = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join Room
    socket.on("join-room", (roomName) => {
      if (roomName) {
        socket.join(roomName);
        console.log(`User ${socket.id} joined room: ${roomName}`);
        io.to(roomName).emit("welcome", `Welcome to the room: ${roomName}`);
      } else {
        console.log("Room name is empty!");
      }
    });

    // Function to check if the user is blocked
    const isBlocked = async (userId, roomName) => {
      try {
        // Find the chat between the current user and the user in the room
        const chat = await Chat.findOne({
          participants: { $all: [userId, roomName] },
        });

        if (!chat) {
          console.log("Chat not found.");
          return false; // If no chat found, not blocked
        }

        // Check if the current user is in the blocked list
        if (chat.blockedUsers.includes(userId)) {
          return true; // User is blocked
        }

        return false; // User is not blocked
      } catch (err) {
        console.error(err);
        return false;
      }
    };

    // Receive and Broadcast Messages
    socket.on("message", async ({ message, room, sender }) => {
      if (room) {
        // Check if the sender is blocked in the room before sending the message
        const blocked = await isBlocked(sender, room);
        
        if (blocked) {
          socket.emit("error", "You are blocked from sending messages in this chat.");
        } else {
          io.to(room).emit("receive-message", {
            sender: sender,
            message,
            timestamp: new Date(),
          });
        }
      } else {
        socket.emit("error", "No room specified for the message");
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
