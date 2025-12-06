const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database (always run - connection URL is hardcoded)
const { setupDatabase } = require('./utils/databaseSetup');

(async () => {
  try {
    console.log('🔄 Initializing database connection...');
    await setupDatabase();
    console.log('✅ Database ready - all data served from Cloud PostgreSQL');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Error details:', error.message);
    // Don't exit - let server run for debugging
  }
})();

// Routes
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const healthInfo = {
    status: 'OK',
    message: 'Server is running',
    database: 'Checking...',
    recordCount: 0,
    environment: process.env.RAILWAY_ENVIRONMENT || 'local',
    timestamp: new Date().toISOString()
  };

  // Check database connection and record count
  try {
    const pool = require('./config/database');
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM transactions');
    healthInfo.database = 'Connected (Cloud PostgreSQL)';
    healthInfo.recordCount = parseInt(rows[0].count);
  } catch (error) {
    healthInfo.database = 'Connection error';
    healthInfo.error = error.message;
  }

  res.json(healthInfo);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Sales API Server - Data from Cloud PostgreSQL',
    status: 'running',
    environment: process.env.RAILWAY_ENVIRONMENT || 'local',
    database: 'Cloud PostgreSQL Connected',
    dataFlow: 'CSV → Cloud PostgreSQL → API',
    endpoints: {
      health: '/api/health',
      transactions: '/api/transactions',
      filterOptions: '/api/transactions/filter-options'
    },
    importInstructions: 'Run: npm run import-data (to load CSV into database)'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Local: http://localhost:${PORT}`);
  console.log(`☁️  Data Source: Cloud PostgreSQL`);
  console.log(`📊 Database: Connected to Railway`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});