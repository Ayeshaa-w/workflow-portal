const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const {
    register,
    login,
    getPendingUsers,
    approveUser
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

router.get('/pending-users', verifyToken, verifyRole('admin'), getPendingUsers);
router.put('/approve-user/:id', verifyToken, verifyRole('admin'), approveUser);

module.exports = router;