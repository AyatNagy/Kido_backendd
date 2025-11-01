const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const router = express.Router();


//get all users
router.get('/',getAllUsers);

//get user by ID
router.get('/getUser/:userId',getUserById);

//create new user
router.post('/createUser',createUser)

//update user 
router.put('/updateUser/:userId',updateUser)

//delete user
router.delete('/deleteUser/:userId',deleteUser)

module.exports = router;