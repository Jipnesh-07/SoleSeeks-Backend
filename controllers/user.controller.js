const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload"); // Multer middleware for Cloudinary
const { cloudinary } = require("../config/cloudinary"); // Cloudinary config

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("wishlist")
      .populate("cart")
      .populate("joinedCommunities");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .populate("wishlist")
      .populate("cart")
      .populate("joinedCommunities");
    if (!user) return res.status(404).json({ message: "User not found!" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.updateUser = async (req, res) => {
//   const { userId } = req.params; // User ID from the URL params
//   const updateData = req.body; // Data to update

//   try {
//     const user = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//     });
//     if (!user) return res.status(404).json({ message: "User not found!" });

//     res.status(200).json({ user, message: "User updated successfully!" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.updateUser = (req, res) => {
  // Use Multer to handle file upload
  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    const { userId } = req.params; // User ID from the URL params
    const updateData = req.body; // Data to update

    try {
      // If an image is uploaded, add it to the updateData
      if (req.file) {
        updateData.image = req.file.path; // Cloudinary image URL
      }

      // Find user and update their information
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      if (!user) return res.status(404).json({ message: "User not found!" });

      res.status(200).json({ user, message: "User updated successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  const userId = req.user._id; // Get user from auth middleware
  const { sneakerId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.includes(sneakerId)) {
      return res.status(400).json({ message: "Sneaker already in wishlist" });
    }

    user.wishlist.push(sneakerId);
    await user.save();

    res
      .status(200)
      .json({ message: "Sneaker added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const userId = req.user._id; // Get user from auth middleware
  const { sneakerId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cart.includes(sneakerId)) {
      return res.status(400).json({ message: "Sneaker already in cart" });
    }

    user.cart.push(sneakerId);
    await user.save();

    res.status(200).json({ message: "Sneaker added to cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.user._id; // Get user from auth middleware
  const { sneakerId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.cart.includes(sneakerId)) {
      return res.status(400).json({ message: "Sneaker not in cart" });
    }

    // Remove the sneaker from the cart
    user.cart = user.cart.filter(id => id.toString() !== sneakerId.toString());
    await user.save();

    res.status(200).json({ message: "Sneaker removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.removeFromWishlist = async (req, res) => {
  const userId = req.user._id; // Get user from auth middleware
  const { sneakerId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishlist.includes(sneakerId)) {
      return res.status(400).json({ message: "Sneaker not in wishlist" });
    }

    // Remove the sneaker from the cart
    user.wishlist = user.wishlist.filter(id => id.toString() !== sneakerId.toString());
    await user.save();

    res.status(200).json({ message: "Sneaker removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rateUser = async (req, res) => {
  const userId = req.user._id; // Get user from auth middleware
  const { ratingUserId, rating, comment } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ratingEntry = {
      user: ratingUserId,
      rating,
      comment,
      createdAt: new Date(),
    };

    user.ratings.push(ratingEntry);
    await user.save();

    res
      .status(200)
      .json({ message: "User rated successfully", ratings: user.ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
