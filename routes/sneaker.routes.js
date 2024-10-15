const express = require('express');
const router = express.Router();
const SneakerController = require('../controllers/sneaker.controller');
const authMiddleware = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/auth.middleware')


router.post('/create', authMiddleware, SneakerController.createSneaker);
router.put('/update/:sneakerId', authMiddleware, SneakerController.updateSneaker);
router.delete('/delete/:sneakerId', authMiddleware, SneakerController.deleteSneaker);
router.get('/all', SneakerController.getAllSneakers);
router.get('/all/approved', SneakerController.getAllApprovedSneakers)
router.get('/:sneakerId', SneakerController.getSneakerById);
router.get('/userSneaker/:userId', authMiddleware, SneakerController.getSneakersByUser)
router.patch('/:sneakerId/approve', isAdmin, SneakerController.approveSneaker )

module.exports = router;
