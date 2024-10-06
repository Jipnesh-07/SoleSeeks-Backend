const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const bidRoutes = require('./routes/bid.routes');
const Bid = require('./models/bid.model');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://jipneshjindal07:Jipnesh1234@cluster01.qynja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01', {
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
    console.log('New client connected:', socket.id);

    // Join bid room
    socket.on('joinRoom', (bidId) => {
        socket.join(bidId);
        console.log(`Client ${socket.id} joined room ${bidId}`);
    });

    // Place a real-time bid
    socket.on('placeBid', async (data) => {
        const { bidId, amount, userId } = data;
        const bid = await Bid.findById(bidId);

        if (bid && bid.isActive && new Date() <= bid.biddingEndsAt) {
            if (amount >= bid.highestBid + bid.minimumBidIncrement) {
                bid.bids.push({ user: userId, amount });
                bid.highestBid = amount;
                await bid.save();

                io.to(bidId).emit('newBidPlaced', bid);  // Notify room about new bid
            } else {
                socket.emit('bidFailed', { message: 'Bid too low' });
            }
        } else {
            socket.emit('bidFailed', { message: 'Bidding closed or not active' });
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
