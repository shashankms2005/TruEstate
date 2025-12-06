import { useState, useEffect, useCallback } from 'react';
import { fetchTransactions, fetchFilterOptions } from '../services/api';

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  
  const [filters, setFilters] = useState({
    customerRegion: [],
    gender: [],
    ageRange: { min: '', max: '' },
    productCategory: [],
    tags: [],
    paymentMethod: [],
    dateRange: { start: '', end: '' }
  });
  
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    genders: [],
    categories: [],
    tags: [],
    paymentMethods: []
  });
  
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load filter options when component mounts
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load transactions when any dependency changes
  useEffect(() => {
    loadTransactions();
  }, [currentPage, debouncedSearchQuery, filters, sortBy, sortOrder]);

  const loadFilterOptions = async () => {
    try {
      console.time('Loading Filter Options');
      const data = await fetchFilterOptions();
      setFilterOptions(data);
      console.timeEnd('Loading Filter Options');
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.time('Fetching Transactions');
      const data = await fetchTransactions({
        page: currentPage,
        limit: 10,
        search: debouncedSearchQuery,
        filters,
        sortBy,
        sortOrder
      });
      
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalRecords);
      setCurrentPage(data.currentPage);
      console.timeEnd('Fetching Transactions');
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    currentPage,
    totalPages,
    totalRecords,
    searchQuery,
    filters,
    filterOptions,
    sortBy,
    sortOrder,
    setSearchQuery,
    setFilters,
    setCurrentPage,
    setSortBy,
    setSortOrder
  };
};