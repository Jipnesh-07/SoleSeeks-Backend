const Today = require('../models/today.model');
const Sneaker = require('../models/sneaker.model');

// Create Today's Sneaker
exports.createToday = async (req, res) => {
    try {
        const { platformTitle, bannerTitle } = req.body;

        // Find the highest-priced approved sneaker, breaking ties with a secondary criterion
        const highestPricedSneaker = await Sneaker.findOne({ isApproved: true })
            .sort({ price: -1, createdAt: 1 }) // Secondary sort by creation date (oldest first)
            .exec();

        if (!highestPricedSneaker) {
            return res.status(404).json({ message: 'No approved sneakers found.' });
        }

        // Ensure artwork is a single string, not an array
        const artwork = Array.isArray(highestPricedSneaker.image)
            ? highestPricedSneaker.image[0]
            : highestPricedSneaker.image;

        if (!artwork) {
            return res.status(400).json({ message: 'Sneaker does not have a valid image for artwork.' });
        }

        // Check if a Today record already exists for this sneaker
        const existingToday = await Today.findOne({ sneaker: highestPricedSneaker._id });
        if (existingToday) {
            return res.status(400).json({ message: 'Today’s sneaker already exists for the highest-priced sneaker.' });
        }

        const today = new Today({
            artwork, // Use the processed artwork string
            platformTitle,
            bannerTitle,
            sneaker: highestPricedSneaker._id,
        });

        await today.save();

        // Populate the sneaker reference for the response
        const populatedToday = await Today.findById(today._id).populate('sneaker');

        res.status(201).json(populatedToday);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Get All Today's Sneakers
exports.getAllToday = async (req, res) => {
    try {
        const todays = await Today.find().populate('sneaker'); // Populates sneaker details
        res.status(200).json(todays);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Today's Sneaker
exports.updateToday = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedToday = await Today.findByIdAndUpdate(id, updates, { new: true }).populate('sneaker');
        if (!updatedToday) {
            return res.status(404).json({ message: 'Today record not found.' });
        }

        res.status(200).json(updatedToday);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Today's Sneaker
exports.deleteToday = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedToday = await Today.findByIdAndDelete(id);

        if (!deletedToday) {
            return res.status(404).json({ message: 'Today record not found.' });
        }

        res.status(200).json({ message: 'Today record deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
