
const express = require('express');
const cors = require('cors');
const { init } = require('./oracle');
const salesRouter = require('./routes/sales');
const cashierRouter = require('./routes/cashiers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sales', salesRouter);
app.use('/api/cashiers', cashierRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'active',
    db: 'Oracle',
    time: new Date().toISOString()
  });
});

// Initialize Oracle Pool and Start Server
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Mooi Mart POS backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

