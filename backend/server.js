const express = require('express');
const cors = require('cors');
const { init } = require('./oracle');
const salesRouter = require('./routes/sales');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sales', salesRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', db: 'Oracle', time: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize
init().then(() => {
    app.listen(PORT, () => {
        console.log(`Mooi Mart POS backend running on http://localhost:${PORT}`);
        console.log(`Available endpoints:`);
        console.log(`- POST /api/sales`);
        console.log(`- GET /api/sales/reports`);
        console.log(`- GET /api/health`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});