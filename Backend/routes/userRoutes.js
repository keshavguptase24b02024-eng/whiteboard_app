const express = require('express'); 
const {createUser, verifyEmail, login, googleLogin, getUserProfile} = require('../controllers/userController')
const {validateRegister} = require('../middlewares/validation');
const authorize = require('../middlewares/authorization');
const router = express.Router();

router.post('/login', (req,res) => { login(req,res); });

router.post('/register', validateRegister, (req,res) => { createUser(req,res); });

router.get('/user', authorize, getUserProfile)

router.post('/google-login', googleLogin);

router.post("/verify", verifyEmail);

module.exports = router; 