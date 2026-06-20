const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai_c');

router.post('/trip-summary', aiController.tripSummary);

module.exports = router;
