const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/sales.db');

const getDb = () => {
  return new Database(DB_PATH, { readonly: true });
};

const buildWhereClause = (filters) => {
  const conditions = [];
  const params = [];

  // Search
  if (filters.search) {
    conditions.push('(LOWER(customer_name) LIKE ? OR phone_number LIKE ?)');
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    params.push(searchTerm, searchTerm);
  }

  // Customer Region
  if (filters.customerRegion && filters.customerRegion.length > 0) {
    const placeholders = filters.customerRegion.map(() => '?').join(',');
    conditions.push(`customer_region IN (${placeholders})`);
    params.push(...filters.customerRegion);
  }

  // Gender
  if (filters.gender && filters.gender.length > 0) {
    const placeholders = filters.gender.map(() => '?').join(',');
    conditions.push(`gender IN (${placeholders})`);
    params.push(...filters.gender);
  }

  // Age Range
  if (filters.ageMin !== null) {
    conditions.push('age >= ?');
    params.push(filters.ageMin);
  }
  if (filters.ageMax !== null) {
    conditions.push('age <= ?');
    params.push(filters.ageMax);
  }

  // Product Category
  if (filters.productCategory && filters.productCategory.length > 0) {
    const placeholders = filters.productCategory.map(() => '?').join(',');
    conditions.push(`product_category IN (${placeholders})`);
    params.push(...filters.productCategory);
  }

  // Tags
  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map(() => 'tags LIKE ?').join(' OR ');
    conditions.push(`(${tagConditions})`);
    filters.tags.forEach(tag => params.push(`%${tag}%`));
  }

  // Payment Method
  if (filters.paymentMethod && filters.paymentMethod.length > 0) {
    const placeholders = filters.paymentMethod.map(() => '?').join(',');
    conditions.push(`payment_method IN (${placeholders})`);
    params.push(...filters.paymentMethod);
  }

  // Date Range
  if (filters.dateStart) {
    conditions.push('date >= ?');
    params.push(filters.dateStart);
  }
  if (filters.dateEnd) {
    conditions.push('date <= ?');
    params.push(filters.dateEnd);
  }

  return { conditions, params };
};

const buildOrderByClause = (sortBy, sortOrder) => {
  const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  switch (sortBy) {
    case 'date':
      return `ORDER BY date ${orderDir}`;
    case 'quantity':
      return `ORDER BY quantity ${orderDir}`;
    case 'customerName':
      return `ORDER BY customer_name ${orderDir}`;
    default:
      return `ORDER BY date ${orderDir}`;
  }
};

exports.getFilteredTransactions = (page, limit, filters, sortBy, sortOrder) => {
  try {
    console.time('Database Query');
    const db = getDb();

    const { conditions, params } = buildWhereClause(filters);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderByClause = buildOrderByClause(sortBy, sortOrder);

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM transactions ${whereClause}`;
    const { count } = db.prepare(countQuery).get(...params);
    
    const totalRecords = count;
    const totalPages = Math.ceil(totalRecords / limit);
    const offset = (page - 1) * limit;

    // Get paginated data
    const dataQuery = `
      SELECT 
        transaction_id as "Transaction ID",
        date as "Date",
        customer_id as "Customer ID",
        customer_name as "Customer Name",
        phone_number as "Phone Number",
        gender as "Gender",
        age as "Age",
        customer_region as "Customer Region",
        customer_type as "Customer Type",
        product_id as "Product ID",
        product_name as "Product Name",
        brand as "Brand",
        product_category as "Product Category",
        tags as "Tags",
        quantity as "Quantity",
        price_per_unit as "Price per Unit",
        discount_percentage as "Discount Percentage",
        total_amount as "Total Amount",
        final_amount as "Final Amount",
        payment_method as "Payment Method",
        order_status as "Order Status",
        delivery_type as "Delivery Type",
        store_id as "Store ID",
        store_location as "Store Location",
        salesperson_id as "Salesperson ID",
        employee_name as "Employee Name"
      FROM transactions
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const transactions = db.prepare(dataQuery).all(...params, limit, offset);
    
    db.close();
    console.timeEnd('Database Query');

    return {
      transactions,
      currentPage: page,
      totalPages,
      totalRecords,
      pageSize: limit
    };
  } catch (error) {
    console.error('Error in getFilteredTransactions:', error);
    throw error;
  }
};

exports.getFilterOptions = () => {
  try {
    const db = getDb();

    const regions = db.prepare('SELECT DISTINCT customer_region FROM transactions WHERE customer_region IS NOT NULL ORDER BY customer_region').all().map(r => r.customer_region);
    
    const genders = db.prepare('SELECT DISTINCT gender FROM transactions WHERE gender IS NOT NULL ORDER BY gender').all().map(g => g.gender);
    
    const categories = db.prepare('SELECT DISTINCT product_category FROM transactions WHERE product_category IS NOT NULL ORDER BY product_category').all().map(c => c.product_category);
    
    const paymentMethods = db.prepare('SELECT DISTINCT payment_method FROM transactions WHERE payment_method IS NOT NULL ORDER BY payment_method').all().map(p => p.payment_method);

    // Extract unique tags
    const tagsResult = db.prepare('SELECT DISTINCT tags FROM transactions WHERE tags IS NOT NULL').all();
    const tagsSet = new Set();
    tagsResult.forEach(row => {
      if (row.tags) {
        row.tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
      }
    });
    const tags = Array.from(tagsSet).sort();

    db.close();

    return {
      regions,
      genders,
      categories,
      tags,
      paymentMethods
    };
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    throw error;
  }
};