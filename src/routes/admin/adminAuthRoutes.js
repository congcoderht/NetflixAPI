const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');
const {authenticate} = require('../../middleware/auth');

router.post('/login', adminAuthController.login);

module.exports = router;