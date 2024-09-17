const User = require('../models/user.model');
const Community = require('../models/community.model');
const Post = require('../models/post.model');

// Join a community
exports.joinCommunity = async (req, res) => {
    const { communityId } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user.joinedCommunities.includes(communityId)) {
            user.joinedCommunities.push(communityId);
            await user.save();
        }
        res.status(200).json({ message: 'Joined community' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a Post
exports.createPost = async (req, res) => {
    const { content, image, communityId } = req.body;
    try {
        const post = new Post({
            content, image, community: communityId, createdBy: req.user._id
        });
        await post.save();
        res.status(201).json({ post });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Leave a community
exports.leaveCommunity = async (req, res) => {
    const { communityId } = req.body;
    try {
        const user = await User.findById(req.user._id);
        user.joinedCommunities = user.joinedCommunities.filter(id => id.toString() !== communityId);
        await user.save();
        res.status(200).json({ message: 'Left community' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get posts by community
exports.getPostsByCommunity = async (req, res) => {
    const { communityId } = req.params;
    try {
        const posts = await Post.find({ community: communityId }).populate('createdBy', 'username');
        res.status(200).json({ posts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a user’s joined communities
exports.getUserCommunities = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('joinedCommunities');
        res.status(200).json({ communities: user.joinedCommunities });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new community
exports.createCommunity = async (req, res) => {
    const { name, description } = req.body;
    try {
        const community = new Community({ name, description });
        await community.save();
        res.status(201).json({ community });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get community details
exports.getCommunityDetails = async (req, res) => {
    const { communityId } = req.params;
    try {
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        res.status(200).json({ community });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update community details
exports.updateCommunity = async (req, res) => {
    const { communityId } = req.params;
    const { name, description } = req.body;
    try {
        const community = await Community.findByIdAndUpdate(
            communityId,
            { name, description },
            { new: true }
        );
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        res.status(200).json({ community });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a community
exports.deleteCommunity = async (req, res) => {
    const { communityId } = req.params;
    try {
        const community = await Community.findByIdAndDelete(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        // Optionally, remove community from all users who joined it
        await User.updateMany(
            { joinedCommunities: communityId },
            { $pull: { joinedCommunities: communityId } }
        );
        res.status(200).json({ message: 'Community deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
