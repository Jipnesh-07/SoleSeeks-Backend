const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require("cors")

require('dotenv').config();
connectDB();

app.use(express.json());
app.use(cors())

// Import routes
const userRoutes = require('./routes/user.routes');
const sneakerRoutes = require('./routes/sneaker.routes');
const communityRoutes = require('./routes/community.routes');
const bidRoutes = require('./routes/bid.routes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/sneakers', sneakerRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/bids', bidRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
