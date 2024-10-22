const Sneaker = require('../models/sneaker.model');
const { adjustPriceByCondition } = require('../utils/priceHelper');

exports.createSneaker = async (req, res) => {
    const { title, description, price, brand, size, condition } = req.body;
    try {
        const adjustedPrice = adjustPriceByCondition(price, condition);

        // Upload image and usdzFile to Cloudinary
        const imageUrls = req.files['image'] ? req.files['image'].map(file => file.path) : [];
        const usdzFileUrl = req.files['usdzFile'] ? req.files['usdzFile'][0].path : '';

        const sneaker = new Sneaker({
            title,
            description,
            price: adjustedPrice,
            brand,
            image: imageUrls,
            usdzFile: usdzFileUrl,
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
    const { title, description, price, brand, size, condition } = req.body;

    try {
        const updatedPrice = adjustPriceByCondition(price, condition);

        // Upload new image and usdzFile if provided
        const imageUrls = req.files['image'] ? req.files['image'].map(file => file.path) : [];
        const usdzFileUrl = req.files['usdzFile'] ? req.files['usdzFile'][0].path : '';

        const updateData = {
            title,
            description,
            price: updatedPrice,
            brand,
            size,
            condition,
        };

        // Update image and usdzFile only if new files are provided
        if (imageUrls.length > 0) updateData.image = imageUrls;
        if (usdzFileUrl) updateData.usdzFile = usdzFileUrl;

        const sneaker = await Sneaker.findByIdAndUpdate(sneakerId, updateData, { new: true });

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

