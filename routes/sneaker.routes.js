const express = require('express');
const router = express.Router();
const SneakerController = require('../controllers/sneaker.controller');
const authMiddleware = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/auth.middleware');
const upload = require('../middleware/upload'); // Import the upload middleware

// Route to create a sneaker with image and usdzFile upload
router.post('/create', authMiddleware, upload.fields([
    { name: 'image', maxCount: 5 }, // Allow up to 5 images
    { name: 'usdzFile', maxCount: 1 } // Allow only 1 USDZ file
]), SneakerController.createSneaker);

// Route to update a sneaker with optional image and usdzFile upload
router.put('/update/:sneakerId', authMiddleware, upload.fields([
    { name: 'image', maxCount: 5 }, // Allow up to 5 images
    { name: 'usdzFile', maxCount: 1 } // Allow only 1 USDZ file
]), SneakerController.updateSneaker);

// Other routes remain unchanged
router.delete('/delete/:sneakerId', authMiddleware, SneakerController.deleteSneaker);
router.get('/all', SneakerController.getAllSneakers);
router.get('/all/approved', SneakerController.getAllApprovedSneakers);
router.get('/:sneakerId', SneakerController.getSneakerById);
router.get('/userSneaker/:userId', authMiddleware, SneakerController.getSneakersByUser);
router.patch('/:sneakerId/approve', isAdmin, SneakerController.approveSneaker);

module.exports = router;
