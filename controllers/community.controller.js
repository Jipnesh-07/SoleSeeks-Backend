const User = require("../models/user.model");
const Community = require("../models/community.model");
const Post = require("../models/post.model");
const upload = require('../middleware/upload'); // Assuming 'upload' is located in middleware folder

// Join a community
exports.joinCommunity = async (req, res) => {
  const { communityId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user.joinedCommunities.includes(communityId)) {
      user.joinedCommunities.push(communityId);
      await user.save();
    }
    res.status(200).json({ message: "Joined community" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a Community with an image
exports.createCommunity = [
  upload.single('image'), // Middleware to handle image upload
  async (req, res) => {
    const { name, description } = req.body;
    try {
      const community = new Community({
        name,
        description,
        image: req.file ? req.file.path : null, // Cloudinary image URL
      });
      await community.save();
      res.status(201).json({ community });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// Update a Community image
exports.updateCommunity = [
  upload.single('image'), // Middleware to handle image upload
  async (req, res) => {
    const { communityId } = req.params;
    const { name, description } = req.body;
    try {
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      // If a new image is uploaded, replace the old one
      if (req.file) {
        community.image = req.file.path; // Cloudinary image URL
      }

      community.name = name || community.name;
      community.description = description || community.description;

      await community.save();
      res.status(200).json({ community });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

exports.createPost = async (req, res) => {
  const { content } = req.body;

  // Parse communityIds only if it exists
  let communityIds;
  try {
    communityIds = req.body.communityIds ? JSON.parse(req.body.communityIds) : [];
  } catch (err) {
    return res.status(400).json({ message: 'Invalid communityIds format. It must be a JSON array.' });
  }

  // Validate that communityIds is an array
  if (!Array.isArray(communityIds)) {
    return res.status(400).json({ message: 'communityIds must be an array' });
  }

  try {
    const posts = [];
    let imageUrl = null;

    // If there's an image in the request, upload to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    for (let communityId of communityIds) {
      console.log(`Processing communityId: ${communityId}`);

      // Check if the community ID is valid
      if (!mongoose.Types.ObjectId.isValid(communityId)) {
        console.log(`Invalid community ID: ${communityId}`);
        return res.status(400).json({ message: `Invalid community ID: ${communityId}` });
      }

      // Find the community
      const isCommunity = await Community.findById(communityId);
      if (!isCommunity) {
        console.log(`Community with ID ${communityId} doesn't exist!`);
        return res.status(404).json({ message: `Community with ID ${communityId} doesn't exist!` });
      }

      // Create the post
      const post = new Post({
        content,
        image: imageUrl, // Store the Cloudinary image URL
        community: communityId,
        createdBy: req.user._id,
      });

      await post.save();
      console.log(`Post created with ID: ${post._id}`);

      // Add post to the community
      isCommunity.posts.push(post._id);
      await isCommunity.save();

      // Add the post to the posts array
      posts.push(post);
    }

    console.log(`Total posts created: ${posts.length}`);

    res.status(201).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// Leave a community
exports.leaveCommunity = async (req, res) => {
  const { communityId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    user.joinedCommunities = user.joinedCommunities.filter(
      (id) => id.toString() !== communityId
    );
    await user.save();
    res.status(200).json({ message: "Left community" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get posts by community
exports.getPostsByCommunity = async (req, res) => {
  const { communityId } = req.params;
  try {
    const posts = await Post.find({ community: communityId }).populate(
      "createdBy",
      "username"
    );
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a user’s joined communities
exports.getUserCommunities = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "joinedCommunities"
    );
    res.status(200).json({ communities: user.joinedCommunities });
  } catch (err) {
    res.status500.json({ message: err.message });
  }
};

// Get all communities
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    res.status(200).json({ communities });
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
      return res.status(404).json({ message: "Community not found" });
    }
    // Optionally, remove community from all users who joined it
    await User.updateMany(
      { joinedCommunities: communityId },
      { $pull: { joinedCommunities: communityId } }
    );
    res.status(200).json({ message: "Community deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
