const express = require('express');
const router = express.Router();
const { completeLesson, getMyProgress } = require('../controllers/progressController');
const authenticate = require('../middlewares/authmiddleware');

router.post('/complete', authenticate, completeLesson);

router.get('/my', authenticate, getMyProgress);

module.exports = router;