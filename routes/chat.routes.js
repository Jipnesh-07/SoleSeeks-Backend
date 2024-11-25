const express = require('express');
const { createMessage, getMessages } = require('../controllers/message.controller');
const { getGroups } = require('../controllers/group.controller');
const authenticate = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post('/messages', authenticate, createMessage);
router.get('/messages/:groupId', getMessages);
router.get('/groups', getGroups);

module.exports = router;
