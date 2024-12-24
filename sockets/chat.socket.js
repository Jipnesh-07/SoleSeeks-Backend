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

    // Receive and Broadcast Messages
    socket.on("message", ({ message, room, sender }) => {
      if (room) {
        io.to(room).emit("receive-message", {
          sender: socket.id,
          message,
          timestamp: new Date(),
        });
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
