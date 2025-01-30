const User = require("../models/user.model");
const Community = require("../models/community.model");
const Post = require("../models/post.model");
const mongoose = require("mongoose");

const upload = require("../middleware/upload"); // Multer middleware for Cloudinary
const { cloudinary } = require("../config/cloudinary"); // Cloudinary config
const uploadImageToCloudinary = require("../utils/uploadImage")

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
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading image' });
    }

    const { content, createdBy } = req.body;
    let { communityIds } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Content is required and must be a string.' });
    }

    if (!communityIds) {
      return res.status(400).json({ message: 'Community IDs are required.' });
    }

    try {
      // Parse communityIds
      communityIds = JSON.parse(communityIds); // Check JSON parsing
      communityIds = communityIds.map(id => new mongoose.Types.ObjectId(id)); // Convert to ObjectId
      console.log('Parsed and converted communityIds:', communityIds);

      // Validate community IDs
      const communities = await Community.find({ _id: { $in: communityIds } });
      if (communities.length !== communityIds.length) {
        return res.status(400).json({ message: 'One or more community IDs are invalid.' });
      }

      // Handle image upload
      const image = req.file ? req.file.path : null;

      // Save the post
      const newPost = new Post({
        content,
        image,
        community: communityIds,
        createdBy: req.user._id, // Ensure user ID is valid
      });

      console.log('New Post to be saved:', newPost);
      await newPost.save();

      // Optional: Update communities to include this post
      const updateResult = await Community.updateMany(
        { _id: { $in: communityIds } },
        { $push: { posts: newPost._id } } // Assuming communities have a posts field
      );
      console.log('Community update result:', updateResult);

      return res.status(200).json({
        message: 'Post created successfully!',
        post: newPost,
      });
    } catch (error) {
      console.error('Error creating post:', error.message);
      return res.status(500).json({ message: 'Server error while creating post.' });
    }
  });
};





// exports.leaveCommunity = async (req, res) => {
//   try {
//       const userId = req.user._id;
//       const { communityId } = req.body;

//       // Remove community from joinedCommunities and add to leftCommunities
//       const user = await User.findById(userId);

//       const filteredList = user.joinedCommunities.filter(id => id === communityId);
//       user.joinedCommunities = filteredList;

//       if (!user.leftCommunities.includes(communityId)) user.leftCommunities.push(communityId);
//       await user.save();

//       res.status(200).json({ message: "Community left successfully" });
//   } catch (err) {
//       res.status(500).json({ message: err.message });
//   }
// };
exports.leaveCommunity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { communityId } = req.body;

    // Check if communityId is provided
    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is a member of the community
    if (!user.joinedCommunities.includes(communityId)) {
      return res.status(400).json({ message: "User is not a member of this community" });
    }

    // Remove the communityId from the joinedCommunities array
    user.joinedCommunities = user.joinedCommunities.filter(id => {
      return id.toString() !== communityId.toString(); // Make sure to convert both to strings for accurate comparison
    });

    // If the communityId isn't already in leftCommunities, add it
    if (!user.leftCommunities.includes(communityId)) {
      user.leftCommunities.push(communityId);
    }

    // Save the updated user document
    await user.save();

    // Optionally: Update the community to reflect the user leaving (e.g., decrement member count if necessary)
    // await Community.findByIdAndUpdate(communityId, { $pull: { members: userId } });

    res.status(200).json({ message: "Community left successfully" });
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
      "name image"
    );
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get a user’s joined communities
exports.getUserCommunities = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("joinedCommunities");
    res.status(200).json({ communities: user.joinedCommunities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a user’s left communities
// exports.getLeftCommunities = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate("leftCommunities");
//     res.status(200).json({ communities: user.leftCommunities });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// Get a user’s left communities
exports.getLeftCommunities = async (req, res) => {
  try {
      const user = await User.findById(req.user._id).populate("leftCommunities");

      console.log(user); // Check the user object in the console

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ communities: user.leftCommunities });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};



// Get all communities
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().lean();
    
    // Exclude 'posts' from each community
    const dataToSend = communities.map(({ posts, ...rest }) => rest);

    res.status(200).json({ communities: dataToSend });
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

exports.flagPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { flagType } = req.body;

    const validFlags = [
      "bullyingOrUnwantedContact",
      "violenceHateOrExploitation",
      "sellingOrPromotingRestrictedItems",
      "nudityOrSexualActivity",
      "scamFraudOrSpam",
      "falseInformation",
    ];

    if (!validFlags.includes(flagType)) {
      return res.status(400).json({ message: "Invalid flag reason" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Increment the flag count
    post.flags[flagType] = (post.flags[flagType] || 0) + 1;
    post.flags.totalFlags += 1;

    await post.save();

    // Fetch the user associated with the post
    const user = await User.findById(post.createdBy);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send a warning if the total flags exceed 5
    if (post.flags.totalFlags >= 5) {
      user.warnings = (user.warnings || 0) + 1;

      // Notify the user about the warning
      console.log(
        `Warning sent to user ${user.name}: Abusive behavior in the community.`
      );

      // // If the warning count exceeds 30, the admin can block the user
      // if (user.warnings >= 30) {
      //   user.isBlocked = true;
      //   console.log(`User ${user.name} has been blocked due to repeated warnings.`);
      // }

      await user.save();
    }

    res.status(200).json({ message: "Post flagged successfully.", post });
  } catch (error) {
    res.status(500).json({ message: "Error flagging the post.", error: error.message });
  }
};

// Get flags for a particular post by ID
exports.getPostFlags = async (req, res) => {
  try {
    const { postId } = req.params;

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Extract the flags and flag types
    const { flags } = post;
    const flagDetails = Object.entries(flags).reduce((acc, [key, value]) => {
      if (key !== "totalFlags") {
        acc.push({ type: key, count: value });
      }
      return acc;
    }, []);

    res.status(200).json({
      totalFlags: flags.totalFlags || 0,
      flagDetails,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving post flags.", error: error.message });
  }
};