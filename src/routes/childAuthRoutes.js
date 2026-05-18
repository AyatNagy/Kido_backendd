const express = require('express');
const router  = express.Router();

const { childRegister, childLogin, setInitialLevel, getMyChildren } = require('../controllers/ChildController');
const { getChildProgressForParent } = require('../controllers/progressController');
const authenticate = require('../middlewares/authmiddleware');

router.post('/register', authenticate, childRegister);
router.post('/login',    childLogin);
router.put('/set-level', authenticate, setInitialLevel);
router.get('/my',        authenticate, getMyChildren);        
router.get('/:childId/progress', authenticate, getChildProgressForParent);

module.exports = router;