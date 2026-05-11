const express = require('express');
const router = express.Router();
const { submitAssessment, getChildAssessments } = require('../controllers/assessmentController');
const authenticate = require('../middlewares/authmiddleware');

router.post('/submit', authenticate, submitAssessment);

router.get('/child/:childId', authenticate, getChildAssessments);

module.exports = router;