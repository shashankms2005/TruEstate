import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

const TransactionTable = ({ transactions, loading, error, viewMode = 'standard' }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  const [copiedPhone, setCopiedPhone] = useState(null);

  const handleCopyPhone = (phone) => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-12 text-center text-red-500">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-12 text-center text-gray-500">
          <p className="font-medium">No transactions found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  const standardColumns = [
    { key: 'Transaction ID', label: 'Transaction ID', field: 'Transaction ID' },
    { key: 'Date', label: 'Date', field: 'Date' },
    { key: 'Customer ID', label: 'Customer ID', field: 'Customer ID' },
    { key: 'Customer Name', label: 'Customer name', field: 'Customer Name' },
    { key: 'Phone Number', label: 'Phone Number', field: 'Phone Number' },
    { key: 'Gender', label: 'Gender', field: 'Gender' },
    { key: 'Age', label: 'Age', field: 'Age' },
    { key: 'Product Category', label: 'Product Category', field: 'Product Category' },
    { key: 'Quantity', label: 'Quantity', field: 'Quantity' },
  ];

  const fullColumns = [
    { key: 'Customer ID', label: 'Customer ID', field: 'Customer ID' },
    { key: 'Customer Name', label: 'Customer name', field: 'Customer Name' },
    { key: 'Phone Number', label: 'Phone Number', field: 'Phone Number' },
    { key: 'Gender', label: 'Gender', field: 'Gender' },
    { key: 'Age', label: 'Age', field: 'Age' },
    { key: 'Product Category', label: 'Product Category', field: 'Product Category' },
    { key: 'Quantity', label: 'Quantity', field: 'Quantity' },
    { key: 'Final Amount', label: 'Total Amount', field: 'Final Amount' },
    { key: 'Customer Region', label: 'Customer region', field: 'Customer Region' },
  ];

  const columns = viewMode === 'full' ? fullColumns : standardColumns;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs bg-[#F3F3F3] font-medium text-gray-600 whitespace-nowrap uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {transactions.map((txn, index) => (
              <tr key={txn._id || index} className="hover:bg-gray-50 transition-colors">

                {viewMode === 'standard' && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {txn['Transaction ID'] || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {txn.Date || '-'}
                    </td>
                  </>
                )}

                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {txn['Customer ID'] || '-'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {txn['Customer Name'] || '-'}
                </td>

                {/* PHONE NUMBER WITH +91 */}
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap">
                      {txn['Phone Number'] ? `+91 ${txn['Phone Number']}` : '-'}
                    </span>

                    {txn['Phone Number'] && (
                      <button
                        onClick={() => handleCopyPhone(txn['Phone Number'])}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy phone number"
                      >
                        {copiedPhone === txn['Phone Number'] ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {txn.Gender || '-'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {txn.Age || '-'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {txn['Product Category'] || '-'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {txn.Quantity || '-'}
                </td>

                {viewMode === 'full' && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                      {txn['Final Amount']
                        ? `₹ ${Number(txn['Final Amount']).toLocaleString('en-IN')}`
                        : '-'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {txn['Customer Region'] || '-'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
