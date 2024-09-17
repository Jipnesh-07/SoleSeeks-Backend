const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/wishlist', authMiddleware, UserController.addToWishlist);
router.post('/cart', authMiddleware, UserController.addToCart);
router.post('/rate', authMiddleware, UserController.rateUser);


module.exports = router;
