const pool = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('🔄 Creating database tables...');
    
    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        transaction_id TEXT,
        date TEXT,
        customer_id TEXT,
        customer_name TEXT,
        phone_number TEXT,
        gender TEXT,
        age INTEGER,
        customer_region TEXT,
        customer_type TEXT,
        product_id TEXT,
        product_name TEXT,
        brand TEXT,
        product_category TEXT,
        tags TEXT,
        quantity INTEGER,
        price_per_unit DECIMAL(10, 2),
        discount_percentage DECIMAL(5, 2),
        total_amount DECIMAL(10, 2),
        final_amount DECIMAL(10, 2),
        payment_method TEXT,
        order_status TEXT,
        delivery_type TEXT,
        store_id TEXT,
        store_location TEXT,
        salesperson_id TEXT,
        employee_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_name ON transactions(customer_name);
      CREATE INDEX IF NOT EXISTS idx_phone_number ON transactions(phone_number);
      CREATE INDEX IF NOT EXISTS idx_customer_region ON transactions(customer_region);
      CREATE INDEX IF NOT EXISTS idx_gender ON transactions(gender);
      CREATE INDEX IF NOT EXISTS idx_product_category ON transactions(product_category);
      CREATE INDEX IF NOT EXISTS idx_payment_method ON transactions(payment_method);
      CREATE INDEX IF NOT EXISTS idx_date ON transactions(date);
    `);

    console.log('✅ Database tables and indexes created successfully');
    
    // Check record count
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM transactions');
    const count = parseInt(rows[0].count);
    console.log(`📊 Current records in database: ${count}`);
    
    if (count === 0) {
      console.log('');
      console.log('⚠️  Database is empty!');
      console.log('📝 To import data, run: npm run import-data');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
};

module.exports = { setupDatabase };