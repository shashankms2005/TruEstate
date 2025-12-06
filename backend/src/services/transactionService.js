const pool = require('../config/database');

const buildWhereClause = (filters) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Search
  if (filters.search) {
    conditions.push(`(LOWER(customer_name) LIKE $${paramIndex} OR phone_number LIKE $${paramIndex + 1})`);
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    params.push(searchTerm, searchTerm);
    paramIndex += 2;
  }

  // Customer Region
  if (filters.customerRegion && filters.customerRegion.length > 0) {
    conditions.push(`customer_region = ANY($${paramIndex})`);
    params.push(filters.customerRegion);
    paramIndex++;
  }

  // Gender
  if (filters.gender && filters.gender.length > 0) {
    conditions.push(`gender = ANY($${paramIndex})`);
    params.push(filters.gender);
    paramIndex++;
  }

  // Age Range
  if (filters.ageMin !== null) {
    conditions.push(`age >= $${paramIndex}`);
    params.push(filters.ageMin);
    paramIndex++;
  }
  if (filters.ageMax !== null) {
    conditions.push(`age <= $${paramIndex}`);
    params.push(filters.ageMax);
    paramIndex++;
  }

  // Product Category
  if (filters.productCategory && filters.productCategory.length > 0) {
    conditions.push(`product_category = ANY($${paramIndex})`);
    params.push(filters.productCategory);
    paramIndex++;
  }

  // Tags
  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map(() => {
      const cond = `tags LIKE $${paramIndex}`;
      paramIndex++;
      return cond;
    }).join(' OR ');
    conditions.push(`(${tagConditions})`);
    filters.tags.forEach(tag => params.push(`%${tag}%`));
  }

  // Payment Method
  if (filters.paymentMethod && filters.paymentMethod.length > 0) {
    conditions.push(`payment_method = ANY($${paramIndex})`);
    params.push(filters.paymentMethod);
    paramIndex++;
  }

  // Date Range
  if (filters.dateStart) {
    conditions.push(`date >= $${paramIndex}`);
    params.push(filters.dateStart);
    paramIndex++;
  }
  if (filters.dateEnd) {
    conditions.push(`date <= $${paramIndex}`);
    params.push(filters.dateEnd);
    paramIndex++;
  }

  return { conditions, params, paramIndex };
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

exports.getFilteredTransactions = async (page, limit, filters, sortBy, sortOrder) => {
  try {
    const { conditions, params, paramIndex } = buildWhereClause(filters);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderByClause = buildOrderByClause(sortBy, sortOrder);

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM transactions ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const totalRecords = parseInt(countResult.rows[0].count);
    
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
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

    return {
      transactions: dataResult.rows,
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

exports.getFilterOptions = async () => {
  try {
    const regionsResult = await pool.query('SELECT DISTINCT customer_region FROM transactions WHERE customer_region IS NOT NULL ORDER BY customer_region');
    const regions = regionsResult.rows.map(r => r.customer_region);
    
    const gendersResult = await pool.query('SELECT DISTINCT gender FROM transactions WHERE gender IS NOT NULL ORDER BY gender');
    const genders = gendersResult.rows.map(g => g.gender);
    
    const categoriesResult = await pool.query('SELECT DISTINCT product_category FROM transactions WHERE product_category IS NOT NULL ORDER BY product_category');
    const categories = categoriesResult.rows.map(c => c.product_category);
    
    const paymentMethodsResult = await pool.query('SELECT DISTINCT payment_method FROM transactions WHERE payment_method IS NOT NULL ORDER BY payment_method');
    const paymentMethods = paymentMethodsResult.rows.map(p => p.payment_method);

    // Extract unique tags
    const tagsResult = await pool.query('SELECT DISTINCT tags FROM transactions WHERE tags IS NOT NULL');
    const tagsSet = new Set();
    tagsResult.rows.forEach(row => {
      if (row.tags) {
        row.tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
      }
    });
    const tags = Array.from(tagsSet).sort();

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