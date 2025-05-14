const express = require('express');
const cors = require('cors');
const { init } = require('./oracle');
const salesRouter = require('./routes/sales');
const cashierRouter = require('./routes/cashiers'); // If you've added a route for cashiers

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for all origins (GitHub Pages frontend needs this)
app.use(cors());

// Parse incoming JSON
app.use(express.json());

// API Routes
app.use('/api/sales', salesRouter);
app.use('/api/cashiers', cashierRouter); // Optional, if using cashier API

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'active', 
    db: 'Oracle', 
    time: new Date().toISOString() 
  });
});

// Initialize Oracle pool and start server
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Mooi Mart POS backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

