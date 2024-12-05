const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload"); // Multer middleware for Cloudinary
const { cloudinary } = require("../config/cloudinary"); // Cloudinary config
const Sneaker = require("../models/sneaker.model");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // Now accepting role in the request
  try {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Set the user role, defaulting to 'user' if no 'admin' role is specified
    const userRole = role === "admin" ? "admin" : "user";

    // Create a new user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      image: "", // You can set a default image or handle it later
    });

    // Save the user to the database
    await user.save();

    // Generate a JWT token for the user
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET // You can adjust the expiration time if needed
    );

    // Send the response with the token and user information
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        wishlist: user.wishlist,
        cart: user.cart,
        joinedCommunities: user.joinedCommunities,
        ratings: user.ratings,
      },
    });
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
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET
    ); // Include role in the token
    res.json({ token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        image: user.image,
        role: user.role,
        wishlist: user.wishlist, // Include populated fields if needed
        cart: user.cart,
        joinedCommunities: user.joinedCommunities,
        ratings: user.ratings
      },
  });
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
    user.cart = user.cart.filter(
      (id) => id.toString() !== sneakerId.toString()
    );
    await user.save();

    res
      .status(200)
      .json({ message: "Sneaker removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCartItems = async (req, res) => {
  const userId = req.user._id;
  try {
    // Find the user by ID
    const user = await User.findById(userId).populate("cart");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the sneakers in the cart
    const cartItems = user.cart;

    res.status(200).json({ cart: cartItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== sneakerId.toString()
    );
    await user.save();

    res
      .status(200)
      .json({
        message: "Sneaker removed from wishlist",
        wishlist: user.wishlist,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWishlistItems = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the sneakers in the wishlist
    const wishlistItems = user.wishlist;

    res.status(200).json({ wishlist: wishlistItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// const User = require("../models/user.model");
// const Sneaker = require("../models/sneaker.model");

exports.getTopSellers = async (req, res) => {
  try {
    // Fetch all users and their listed sneakers
    const users = await User.find()
      .populate("cart")
      .populate("wishlist")
      .populate("joinedCommunities");

    // For each user, get the count of their listed sneakers
    const usersWithListings = await Promise.all(users.map(async (user) => {
      const listedSneakers = await Sneaker.find({ createdBy: user._id });
      return {
        ...user.toObject(),
        totalListings: listedSneakers.length,
        listedSneakers,
      };
    }));

    // Filter users based on the number of listings
    const topSellers = usersWithListings.filter(user => user.totalListings > 0);

    // Sort the top sellers by total listings
    topSellers.sort((a, b) => b.totalListings - a.totalListings);

    res.status(200).json({ topSellers });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: err.message });
  }
};
