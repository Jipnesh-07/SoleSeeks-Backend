const Banner = require('../models/banner.model');

// Add a new banner
exports.addBanner = async (req, res) => {
    try {
        const { title, subtitle } = req.body;

        if (!title || !subtitle) {
            return res.status(400).json({ message: "Title and subtitle are required." });
        }

        const newBanner = new Banner({ title, subtitle });
        await newBanner.save();

        res.status(201).json({ message: "Banner added successfully.", banner: newBanner });
    } catch (error) {
        res.status(500).json({ message: "Error adding banner.", error: error.message });
    }
};

// Get all banners
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });

        res.status(200).json({ message: "Banners retrieved successfully.", banners });
    } catch (error) {
        res.status(500).json({ message: "Error fetching banners.", error: error.message });
    }
};

// Update a banner
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle } = req.body;

        if (!title && !subtitle) {
            return res.status(400).json({ message: "At least one of title or subtitle is required to update." });
        }

        const updatedFields = {};
        if (title) updatedFields.title = title;
        if (subtitle) updatedFields.subtitle = subtitle;

        const updatedBanner = await Banner.findByIdAndUpdate(id, updatedFields, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation rules are applied
        });

        if (!updatedBanner) {
            return res.status(404).json({ message: "Banner not found." });
        }

        res.status(200).json({ message: "Banner updated successfully.", banner: updatedBanner });
    } catch (error) {
        res.status(500).json({ message: "Error updating banner.", error: error.message });
    }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBanner = await Banner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).json({ message: "Banner not found." });
        }

        res.status(200).json({ message: "Banner deleted successfully.", banner: deletedBanner });
    } catch (error) {
        res.status(500).json({ message: "Error deleting banner.", error: error.message });
    }
};
