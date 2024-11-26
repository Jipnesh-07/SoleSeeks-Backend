const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');

// Add a banner
router.post('/add', bannerController.addBanner);

// Get all banners
router.get('/', bannerController.getBanners);

// Update a banner
router.put('/:id', bannerController.updateBanner);

// Delete a banner
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
