const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const requestRoutes = require('./src/routes/requests');
const authRoutes = require('./src/routes/auth');
const uploadRoutes = require('./src/routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static('public'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/upload', uploadRoutes);



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});