const Chat = require('../models/chat.model');
const User = require('../models/user.model');

module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Join Room
    socket.on('join-room', (roomName) => {
      if (roomName) {
        socket.join(roomName);
        console.log(`User ${socket.id} joined room: ${roomName}`);
        io.to(roomName).emit('welcome', `Welcome to the room: ${roomName}`);
      } else {
        console.log('Room name is empty!');
      }
    });
  
    // Receive and Broadcast Messages
    socket.on('message', ({ message, room }) => {
      if (room) {
        io.to(room).emit('receive-message', { sender: socket.id, message, timestamp: new Date() });
      } else {
        socket.emit('error', 'No room specified for the message');
      }
    });
  
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  
  return io;
};

// const Chat = require('../models/chat.model');
// const User = require('../models/user.model');
// const jwt = require('jsonwebtoken'); // If you're using JWT for authentication

// module.exports = (server) => {
//   const io = require('socket.io')(server, {
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//     },
//   });

//   io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);
    
//     // Extract user data (example assumes JWT token sent with handshake)
//     const token = socket.handshake.query.token;  // Token sent in the connection request
//     if (token) {
//       jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//           console.log('Token verification failed');
//         } else {
//           // Attach user ID to socket object
//           socket.userId = decoded.userId; // Assuming the decoded token contains userId
//           console.log(`User ${socket.userId} connected`);
//         }
//       });
//     }

//     // Join Room
//     socket.on('join-room', (roomName) => {
//       if (roomName) {
//         socket.join(roomName);
//         console.log(`User ${socket.userId || socket.id} joined room: ${roomName}`);
//         io.to(roomName).emit('welcome', `Welcome to the room: ${roomName}`);
//       } else {
//         console.log('Room name is empty!');
//       }
//     });

//     // Receive and Broadcast Messages
//     socket.on('message', ({ message, room }) => {
//       if (room) {
//         if (socket.userId) {
//           io.to(room).emit('receive-message', { sender: socket.userId, message, timestamp: new Date() });
//         } else {
//           socket.emit('error', 'User not authenticated');
//         }
//       } else {
//         socket.emit('error', 'No room specified for the message');
//       }
//     });

//     // Disconnect
//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.userId || socket.id}`);
//     });
//   });

//   return io;
// };
