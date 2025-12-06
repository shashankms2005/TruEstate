const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
const { importCSVToDatabase } = require('./utils/databaseSetup');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
(async () => {
  try {
    console.log('🔄 Initializing database...');
    await importCSVToDatabase();
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
})();

// Routes
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});