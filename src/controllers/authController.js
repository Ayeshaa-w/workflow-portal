const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, requested_role } = req.body;
        if (!name || !email || !password || !requested_role) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (!['employee', 'manager'].includes(requested_role)) {
            return res.status(400).json({ error: 'Invalid role requested' });
        }

        const existing = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status',
            [name, email, hashedPassword, requested_role, 'pending']
        );

        res.status(201).json({
            message: 'Registration submitted. Awaiting admin approval.',
            user: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Your account is awaiting admin approval' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ error: 'Your registration was not approved' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPendingUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, status, created_at 
             FROM users WHERE status = 'pending' ORDER BY created_at ASC`
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision, role } = req.body;

        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ error: 'Invalid decision' });
        }

        let query, params;
        if (decision === 'approved') {
            const finalRole = role || null;
            query = 'UPDATE users SET status = $1, role = COALESCE($2, role) WHERE id = $3 RETURNING id, name, email, role, status';
            params = ['approved', finalRole, id];
        } else {
            query = 'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, status';
            params = ['rejected', id];
        }

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: `User ${decision}`,
            user: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, getPendingUsers, approveUser };