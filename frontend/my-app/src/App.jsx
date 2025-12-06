import React, { useState } from 'react';
import Sidebar from './components/SideBar';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import Pagination from './components/Pagination';
import { useTransactions } from './hooks/useTransactions';
import { getInitialFilters } from './utils/filterHelpers';

function App() {
  const {
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
  } = useTransactions();

  const [viewMode, setViewMode] = useState('standard');

  // Calculate summary statistics from current page transactions
  const calculateSummary = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalUnits: 0,
        totalAmount: 0,
        totalDiscount: 0,
        totalSRs: 0,
        discountSRs: 0
      };
    }

    const totalUnits = transactions.reduce((sum, txn) => {
      const qty = Number(txn.Quantity) || 0;
      return sum + qty;
    }, 0);

    const totalAmount = transactions.reduce((sum, txn) => {
      const amount = Number(txn['Final Amount']) || 0;
      return sum + amount;
    }, 0);

    const totalDiscount = transactions.reduce((sum, txn) => {
      const discount = Number(txn.Discount) || Number(txn['Discount Amount']) || 0;
      return sum + discount;
    }, 0);

    const discountSRs = transactions.filter(txn => {
      const discount = Number(txn.Discount) || Number(txn['Discount Amount']) || 0;
      return discount > 0;
    }).length;

    return {
      totalUnits,
      totalAmount,
      totalDiscount,
      totalSRs: transactions.length,
      discountSRs
    };
  };

  const summary = calculateSummary();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (Array.isArray(prev[filterType])) {
        // For checkbox filters (arrays)
        return { ...prev, [filterType]: value };
      }
      // For range and dateRange filters (objects)
      return { ...prev, [filterType]: value };
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setFilters(getInitialFilters());
    setSearchQuery('');
    setCurrentPage(1);
    setSortBy('date');
    setSortOrder('desc');
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 flex-1 p-6">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        <FilterBar
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        <SummaryCards
          totalUnits={summary.totalUnits}
          totalAmount={summary.totalAmount}
          totalDiscount={summary.totalDiscount}
          totalSRs={summary.totalSRs}
          discountSRs={summary.discountSRs}
        />

        {/* View Mode Toggle & Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('standard')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'standard' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Standard View
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'full' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Full Table View
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{transactions.length}</span> of{' '}
            <span className="font-medium">{totalRecords}</span> results
          </div>
        </div>

        <TransactionTable
          transactions={transactions}
          loading={loading}
          error={error}
          viewMode={viewMode}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default App;