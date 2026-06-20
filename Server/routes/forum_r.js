const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum_c');

// GET /api/forum/:room/messages
// room examples: "country_1", "city_3"
router.get('/:room/messages', forumController.getMessages);

module.exports = router;
