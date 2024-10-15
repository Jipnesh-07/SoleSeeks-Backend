const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const bidRoutes = require('./routes/bid.routes');
const Bid = require('./models/bid.model');
const { log } = require('console');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected!')).catch(err => console.log(err));

// API Routes
app.use('/api/bids', bidRoutes);

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log("connected");
    console.log('New client connected:', socket.id);

    // Join bid room
    socket.on('joinRoom', (bidId) => {
        console.log("entered room");
        socket.join(bidId);
        console.log(`Client ${socket.id} joined room ${bidId}`);
    });

    // Place a real-time bid
    socket.on('placeBid', async (data) => {
        const { bidId, amount, userId } = data;
        console.log("Bid attempt:", bidId, amount, userId);

        try {
            const bid = await Bid.findById(bidId);
            console.log("Bid found:", bid);

            if (bid && bid.isActive && new Date() <= bid.biddingEndsAt) {
                if (amount >= bid.highestBid + bid.minimumBidIncrement) {
                    // Add bid to the database
                    bid.bids.push({ user: userId, amount });
                    bid.highestBid = amount;

                    try {
                        await bid.save();  // Save the bid
                        console.log("Bid placed successfully");

                        // Notify all clients in the room about the new bid
                        io.to(bidId).emit('newBidPlaced', bid);
                        console.log("Emitted newBidPlaced event");
                    } catch (err) {
                        console.error("Error saving bid:", err);
                        socket.emit('bidFailed', { message: 'Error saving bid.' });
                    }

                } else {
                    console.log("Bid too low");
                    socket.emit('bidFailed', { message: 'Bid too low' });
                }
            } else {
                console.log("Bidding closed or not active");
                socket.emit('bidFailed', { message: 'Bidding closed or not active' });
            }
        } catch (err) {
            console.error("Error finding bid:", err);
            socket.emit('bidFailed', { message: 'Error processing bid.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
