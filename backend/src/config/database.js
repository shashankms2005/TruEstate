const { Pool } = require('pg');

// Direct connection to Railway PostgreSQL
// Public URL works locally, Railway will override with DATABASE_URL env var
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres:hEWyMLKxadbXOdbFFVsaXKANsmAFzRbj@yamanote.proxy.rlwy.net:34756/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool');
  await pool.end();
  process.exit(0);
});

module.exports = pool;