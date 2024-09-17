const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
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

