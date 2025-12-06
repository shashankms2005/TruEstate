const API_BASE_URL = 'http://localhost:5000/api';

export const fetchTransactions = async (params) => {
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', params.page);
  queryParams.append('limit', params.limit);
  queryParams.append('sortBy', params.sortBy);
  queryParams.append('sortOrder', params.sortOrder);
  
  if (params.search) queryParams.append('search', params.search);
  
  if (params.filters.customerRegion.length > 0) {
    queryParams.append('customerRegion', params.filters.customerRegion.join(','));
  }
  if (params.filters.gender.length > 0) {
    queryParams.append('gender', params.filters.gender.join(','));
  }
  if (params.filters.ageRange.min) {
    queryParams.append('ageMin', params.filters.ageRange.min);
  }
  if (params.filters.ageRange.max) {
    queryParams.append('ageMax', params.filters.ageRange.max);
  }
  if (params.filters.productCategory.length > 0) {
    queryParams.append('productCategory', params.filters.productCategory.join(','));
  }
  if (params.filters.tags.length > 0) {
    queryParams.append('tags', params.filters.tags.join(','));
  }
  if (params.filters.paymentMethod.length > 0) {
    queryParams.append('paymentMethod', params.filters.paymentMethod.join(','));
  }
  if (params.filters.dateRange.start) {
    queryParams.append('dateStart', params.filters.dateRange.start);
  }
  if (params.filters.dateRange.end) {
    queryParams.append('dateEnd', params.filters.dateRange.end);
  }
  
  const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

export const fetchFilterOptions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions/filter-options`);
  if (!response.ok) {
    throw new Error('Failed to fetch filter options');
  }
  return response.json();
};