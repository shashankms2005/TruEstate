const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const importCSVToDatabase = async () => {
  const csvPath = path.join(__dirname, '../../data/sales_data.csv');

  console.log('🔄 Starting CSV import to Cloud PostgreSQL...');
  console.time('CSV Import');

  try {
    // Check if data already exists
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM transactions');
    const count = parseInt(rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Database already has ${count} records.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Do you want to clear and re-import? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() === 'yes') {
        console.log('🗑️  Truncating existing data...');
        await pool.query('TRUNCATE TABLE transactions RESTART IDENTITY');
        console.log('✅ Existing data cleared');
      } else {
        console.log('❌ Import cancelled');
        process.exit(0);
      }
    }

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`);
      console.log(`📝 Please ensure sales_data.csv is in the data/ folder`);
      process.exit(1);
    }

    const transactions = [];
    let rowCount = 0;
    const BATCH_SIZE = 500;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          transactions.push(row);
          rowCount++;

          // Batch insert every 500 rows
          if (transactions.length >= BATCH_SIZE) {
            const batch = transactions.splice(0, BATCH_SIZE);
            insertBatch(batch)
              .then(() => console.log(`✓ Imported ${rowCount} rows...`))
              .catch(reject);
          }
        })
        .on('end', async () => {
          try {
            // Insert remaining rows
            if (transactions.length > 0) {
              await insertBatch(transactions);
            }

            console.timeEnd('CSV Import');
            console.log(`✅ Successfully imported ${rowCount} transactions to Cloud PostgreSQL`);
            
            // Verify import
            const { rows } = await pool.query('SELECT COUNT(*) as count FROM transactions');
            console.log(`📊 Total records in database: ${rows[0].count}`);
            
            await pool.end();
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('❌ Error importing CSV:', error);
    await pool.end();
    throw error;
  }
};

const insertBatch = async (transactions) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO transactions (
        transaction_id, date, customer_id, customer_name, phone_number,
        gender, age, customer_region, customer_type, product_id,
        product_name, brand, product_category, tags, quantity,
        price_per_unit, discount_percentage, total_amount, final_amount,
        payment_method, order_status, delivery_type, store_id,
        store_location, salesperson_id, employee_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `;

    for (const txn of transactions) {
      await client.query(insertQuery, [
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
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Run the import
importCSVToDatabase()
  .then(() => {
    console.log('✅ Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });