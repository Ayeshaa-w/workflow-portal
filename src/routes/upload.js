const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const pool = require('../db');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
};

const upload = multer({ storage, fileFilter });

router.post('/:requestId', verifyToken, upload.single('document'), async (req, res) => {
    try {
        const { requestId } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const existing = await pool.query(
            'SELECT status FROM requests WHERE id = $1', [requestId]
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        if (existing.rows[0].status !== 'pending') {
            return res.status(400).json({ error: 'Cannot change file after request has been reviewed' });
        }

        const filePath = req.file.path;
        const result = await pool.query(
            'UPDATE requests SET file_path = $1 WHERE id = $2 RETURNING *',
            [filePath, requestId]
        );

        res.status(200).json({
            message: 'File uploaded successfully',
            file: req.file.filename,
            request: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;