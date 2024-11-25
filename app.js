const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const socketIO = require('./sockets/chat.socket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

connectDB();

app.use(express.json());

// Import routes
const userRoutes = require('./routes/user.routes');
const sneakerRoutes = require('./routes/sneaker.routes');
const communityRoutes = require('./routes/community.routes');
const bidRoutes = require('./routes/bid.routes');
const chatRoutes = require('./routes/chat.routes');
const bannerRoutes = require('./routes/banner.routes');
const todayRoutes = require('./routes/today.routes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/sneakers', sneakerRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/today', todayRoutes)


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
