const express = require('express');
const cors = require('cors');
const { init } = require('./oracle');
const salesRouter = require('./routes/sales');
const cashierRouter = require('./routes/cashiers'); // Make sure you have this file too

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // ✅ Allow frontend (like GitHub Pages) to access backend
app.use(express.json()); // ✅ Parse incoming JSON

// API routes
app.use('/api/sales', salesRouter);
app.use('/api/cashiers', cashierRouter); // For displaying current cashier

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'active',
    db: 'Oracle',
    time: new Date().toISOString()
  });
});

// Start the app after DB init
init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Mooi Mart POS backend running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
