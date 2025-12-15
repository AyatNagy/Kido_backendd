const express = require('express');
const router = express.Router();
const { childRegister, childLogin } = require('../controllers/ChildController');
const authenticate = require('../middlewares/authmiddleware');

// Child registration (requires parent authentication)
router.post('/register', authenticate, childRegister);

// Child login (no authentication required)
router.post('/login', childLogin);

module.exports = router;
