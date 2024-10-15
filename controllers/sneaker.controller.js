const Sneaker = require('../models/sneaker.model');
const { adjustPriceByCondition } = require('../utils/priceHelper');

exports.createSneaker = async (req, res) => {
    const { title, description, price, brand, image, usdzFile, size, condition } = req.body;
    try {
        const adjustedPrice = adjustPriceByCondition(price, condition);
        const sneaker = new Sneaker({
            title,
            description,
            price: adjustedPrice,
            brand,
            image,
            usdzFile,
            size,
            condition,
            createdBy: req.user._id,
            isApproved: false // Sneaker needs admin approval
        });
        await sneaker.save();
        res.status(201).json({ sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.approveSneaker = async (req, res) => {
    const { sneakerId } = req.params;

    try {
        const sneaker = await Sneaker.findById(sneakerId);
        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        sneaker.isApproved = true; // Admin approves the sneaker
        await sneaker.save();

        res.json({ message: 'Sneaker approved successfully', sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSneaker = async (req, res) => {
    const { sneakerId } = req.params;
    const { title, description, price, brand, image, usdzFile, size, condition } = req.body;

    try {
        const updatedPrice = adjustPriceByCondition(price, condition);
        const sneaker = await Sneaker.findByIdAndUpdate(
            sneakerId,
            {
                title,
                description,
                price: updatedPrice,
                brand,
                image,
                usdzFile,
                size,
                condition
            },
            { new: true }
        );

        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        res.json({ sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSneaker = async (req, res) => {
    const { sneakerId } = req.params;

    try {
        const sneaker = await Sneaker.findByIdAndDelete(sneakerId);

        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        res.json({ message: 'Sneaker deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllSneakers = async (req, res) => {
    try {
        const sneakers = await Sneaker.find();
        res.json({ sneakers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllApprovedSneakers = async (req, res) => {
    try {
        const sneakers = await Sneaker.find({ isApproved: true });
        res.json({ sneakers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getSneakerById = async (req, res) => {
    const { sneakerId } = req.params;

    try {
        const sneaker = await Sneaker.findById(sneakerId);

        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        res.json({ sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getSneakersByUser = async (req, res) => {
    const { userId } = req.params; // Extract userId from URL parameters

    try {
        const sneakers = await Sneaker.find({ createdBy: userId });
        if (sneakers.length === 0) {
            return res.status(404).json({ message: 'No sneakers found for this user' });
        }
        res.json({ sneakers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

