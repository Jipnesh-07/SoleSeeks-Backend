const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/all", UserController.getAllUsers)
router.get("/:userId", UserController.getUser);
router.put("/update/:userId", UserController.updateUser);
router.delete("/delete/:userId", UserController.deleteUser);
router.post("/wishlist", authMiddleware, UserController.addToWishlist);
router.post("/wishlist/remove", authMiddleware, UserController.removeFromWishlist)
router.get("/wishlist/:userId", authMiddleware, UserController.getWishlistItems)
router.post("/cart", authMiddleware, UserController.addToCart);
router.post("/cart/remove", authMiddleware, UserController.removeFromCart)
router.get("/cart/:userId", authMiddleware, UserController.getCartItems)
router.post("/rate", authMiddleware, UserController.rateUser);

module.exports = router;
