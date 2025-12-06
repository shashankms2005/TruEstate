const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const DB_PATH = path.join(__dirname, '../../data/sales.db');

const setupDatabase = () => {
  const db = new Database(DB_PATH);
  
  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      price_per_unit REAL,
      discount_percentage REAL,
      total_amount REAL,
      final_amount REAL,
      payment_method TEXT,
      order_status TEXT,
      delivery_type TEXT,
      store_id TEXT,
      store_location TEXT,
      salesperson_id TEXT,
      employee_name TEXT
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_customer_name ON transactions(customer_name);
    CREATE INDEX IF NOT EXISTS idx_phone_number ON transactions(phone_number);
    CREATE INDEX IF NOT EXISTS idx_customer_region ON transactions(customer_region);
    CREATE INDEX IF NOT EXISTS idx_gender ON transactions(gender);
    CREATE INDEX IF NOT EXISTS idx_product_category ON transactions(product_category);
    CREATE INDEX IF NOT EXISTS idx_payment_method ON transactions(payment_method);
    CREATE INDEX IF NOT EXISTS idx_date ON transactions(date);
  `);

  return db;
};

const importCSVToDatabase = async () => {
  const db = setupDatabase();
  const csvPath = path.join(__dirname, '../../data/sales_data.csv');

  console.log('🔄 Starting CSV import...');
  console.time('CSV Import');

  // Check if data already exists
  const count = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  if (count.count > 0) {
    console.log(`✅ Database already has ${count.count} records`);
    db.close();
    return;
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    db.close();
    return;
  }

  const insert = db.prepare(`
    INSERT INTO transactions (
      transaction_id, date, customer_id, customer_name, phone_number,
      gender, age, customer_region, customer_type, product_id,
      product_name, brand, product_category, tags, quantity,
      price_per_unit, discount_percentage, total_amount, final_amount,
      payment_method, order_status, delivery_type, store_id,
      store_location, salesperson_id, employee_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((transactions) => {
    for (const txn of transactions) {
      insert.run(
        txn['Transaction ID'] || txn['﻿Transaction ID'],
        txn['Date'],
        txn['Customer ID'],
        txn['Customer Name'],
        txn['Phone Number'],
        txn['Gender'],
        parseInt(txn['Age']) || 0,
        txn['Customer Region'],
        txn['Customer Type'],
        txn['Product ID'],
        txn['Product Name'],
        txn['Brand'],
        txn['Product Category'],
        txn['Tags'],
        parseInt(txn['Quantity']) || 0,
        parseFloat(txn['Price per Unit']) || 0,
        parseFloat(txn['Discount Percentage']) || 0,
        parseFloat(txn['Total Amount']) || 0,
        parseFloat(txn['Final Amount']) || 0,
        txn['Payment Method'],
        txn['Order Status'],
        txn['Delivery Type'],
        txn['Store ID'],
        txn['Store Location'],
        txn['Salesperson ID'],
        txn['Employee Name']
      );
    }
  });

  return new Promise((resolve, reject) => {
    const transactions = [];
    let rowCount = 0;

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        transactions.push(row);
        rowCount++;

        // Batch insert every 10000 rows
        if (transactions.length >= 10000) {
          insertMany(transactions);
          console.log(`Imported ${rowCount} rows...`);
          transactions.length = 0; // Clear array
        }
      })
      .on('end', () => {
        // Insert remaining rows
        if (transactions.length > 0) {
          insertMany(transactions);
        }
        
        console.timeEnd('CSV Import');
        console.log(`✅ Successfully imported ${rowCount} transactions`);
        db.close();
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error importing CSV:', error);
        db.close();
        reject(error);
      });
  });
};

module.exports = { setupDatabase, importCSVToDatabase };