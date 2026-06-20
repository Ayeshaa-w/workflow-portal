const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const {
    getAllRequests,
    getRequestById,
    createRequest,
    updateStatus,
    deleteRequest
} = require('../controllers/requestController');

router.get('/', verifyToken, getAllRequests);
router.get('/:id', verifyToken, getRequestById);
router.post('/', verifyToken, createRequest);
router.put('/:id', verifyToken,verifyRole('manager', 'admin'), updateStatus);
router.delete('/:id', verifyToken,verifyRole('admin'), deleteRequest);
router.patch('/:id/edit', verifyToken, editRequest);
module.exports = router;
