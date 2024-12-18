const User = require("../models/user.model");
const Community = require("../models/community.model"); // Community model
const Chat = require("../models/chat.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload"); // Multer middleware for Cloudinary
const { cloudinary } = require("../config/cloudinary"); // Cloudinary config
const Sneaker = require("../models/sneaker.model");
const sendEmail = require("../utils/sendEmail");
const generateString = require("../utils/randomString");
const TempUserModel = require("../models/temp.user.model");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // Now accepting role in the request
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already existed!" });
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set the user role, defaulting to 'user' if no 'admin' role is specified
    const userRole = role === "admin" ? "admin" : "user";

    // Create a new user instance
    user = new User({
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

    const link = `${process.env.SERVER_URL}/api/users/verify/${user._id}`;

    const data = {
      to: user.email,
      subject: "Verify your account",
      body: link,
    };
    sendEmail(data);

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

exports.verifyUser = async (req, res) => {
  const { id } = req.params;
  let user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found!" });

  if (user.isVerified) {
    return res.status(400).json({ message: "User already verified" });
  }

  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "User verified" });
};

exports.sendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const link = `${process.env.SERVER_URL}/api/users/verify/${user._id}`;

    const data = {
      to: user.email,
      subject: "Verify your account",
      body: link,
    };

    sendEmail(data);

    res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Error during email verification:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    // Respond with user data and token
    res.json({
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
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.guestLogin = async (req, res) => {
  const email = "guest@sneakult.com";
  const password = "Abc@123#";

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Something went wrong. Please sign in." });
    }

    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
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
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

exports.userVerificationInfo = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.forgotPassword1 = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = generateString(5);
    await TempUserModel.create({
      userId: user._id,
      code,
    });

    const tempUser = await TempUserModel.findOne({ userId: user._id });

    const data = {
      to: user.email,
      subject: "Verify your account",
      body: `Enter this code in the app to continue the process:=  ${tempUser.code}`,
    };

    sendEmail(data);
    return res
      .status(200)
      .json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.log(error);
  }
};

// exports.forgotPassword2 = async (req, res) => {
//   const { email, code, newPassword } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found"});

//     const tempUser = await TempUserModel.findOne({ userId: user._id });
//     if (!tempUser) return res.status(500).json({ message: "Something went wrong. Try again"});

//     if (code !== tempUser.code) return res.status(400).json({ message: "Entered wrong code"});

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword

//     await user.save();
//     await tempUser.deleteOne();

//     return res.status(200).json({message: "Password changed successfully"});

//   } catch (error) {
//     res.status(500);
//   }
// }

exports.forgotPassword2 = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tempUser = await TempUserModel.findOne({ userId: user._id });
    if (!tempUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong. Try again" });
    }

    // Debugging: Log the codes being compared
    console.log(tempUser);

    // Ensure type and value matching
    if (String(code) !== String(tempUser.code)) {
      return res.status(400).json({ message: "Entered wrong code" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    await tempUser.deleteOne();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in forgotPassword2:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    // Find the user to clean up related data
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // Remove user ID from joined and left communities
    await Community.updateMany(
      { _id: { $in: [...user.joinedCommunities, ...user.leftCommunities] } },
      { $pull: { members: userId } } // Assuming `members` tracks user IDs in communities
    );

    // Clean up sneakers created by the user
    await Sneaker.deleteMany({ createdBy: userId });

    // Handle the wishlist and cart cleanup
    await Sneaker.updateMany(
      { _id: { $in: user.wishlist } },
      { $pull: { interestedUsers: userId } } // Adjust field names if necessary
    );

    await Sneaker.updateMany(
      { _id: { $in: user.cart } },
      { $pull: { cartedBy: userId } } // Adjust field names if necessary
    );

    await Chat.deleteMany({ participants: userId });

    // Finally, delete the user
    await user.deleteOne();

    res
      .status(200)
      .json({ message: "User and all related data deleted successfully!" });
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

    res.status(200).json({
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

exports.getTopSellers = async (req, res) => {
  try {
    // Fetch all users and their listed sneakers
    const users = await User.find()
      .populate("cart")
      .populate("wishlist")
      .populate("joinedCommunities");

    // For each user, get the count of their listed sneakers
    const usersWithListings = await Promise.all(
      users.map(async (user) => {
        const listedSneakers = await Sneaker.find({ createdBy: user._id });
        return {
          ...user.toObject(),
          totalListings: listedSneakers.length,
          listedSneakers,
        };
      })
    );

    // Filter users based on the number of listings
    const topSellers = usersWithListings.filter(
      (user) => user.totalListings > 0
    );

    // Sort the top sellers by total listings
    topSellers.sort((a, b) => b.totalListings - a.totalListings);

    res.status(200).json({ topSellers });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { userId } = req.params; // Get userId from params
  const { oldPassword, newPassword } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare old password with the current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
