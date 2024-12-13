const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.get("/verify/:id", UserController.verifyUser);
router.post("/send-verification", UserController.sendVerification);
router.put("/:userId/changepassword", UserController.changePassword);
router.post("/forgot/1", UserController.forgotPassword1)
router.post("/forgot/2", UserController.forgotPassword2)

router.get("/all", UserController.getAllUsers)
router.get("/:userId", UserController.getUser);
router.put("/update/:userId", UserController.updateUser);
router.delete("/delete/:userId", UserController.deleteUser);

router.post("/wishlist", authMiddleware, UserController.addToWishlist);
router.post("/wishlist/remove", authMiddleware, UserController.removeFromWishlist)
router.get("/wishlist/:userId", authMiddleware, UserController.getWishlistItems)

router.get("/cart/1", authMiddleware, UserController.getCartItems)
router.post("/cart", authMiddleware, UserController.addToCart);
router.post("/cart/remove", authMiddleware, UserController.removeFromCart)

router.post("/rate", authMiddleware, UserController.rateUser);
router.get("/topSellers", UserController.getTopSellers)

module.exports = router;