import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-lg font-semibold text-gray-900">
        Sales Management System
      </h1>

      <div className="relative w-[330px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        <input
          type="text"
          placeholder="Name, Phone no."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md 
                     bg-[#F3F3F3] text-sm focus:outline-none focus:ring-1 
                     focus:ring-gray-400 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

export default Header;
