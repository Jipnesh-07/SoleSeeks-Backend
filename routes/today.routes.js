const express = require('express');
const router = express.Router();
const todayController = require('../controllers/today.controller');

// Routes for Today
router.post('/create', todayController.createToday);       // Create Today's Sneaker
router.get('/', todayController.getAllToday);        // Get all Today's Sneakers
router.put('/update/:id', todayController.updateToday);    // Update Today's Sneaker
router.delete('/delete/:id', todayController.deleteToday); // Delete Today's Sneaker

module.exports = router;
