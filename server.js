const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
    res.send('Backend is running successfully!');
});

// Example API endpoint
app.get('/api/data', (req, res) => {
    res.json({ message: 'This is your backend data!' });
});

// Dynamic port (required for Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

