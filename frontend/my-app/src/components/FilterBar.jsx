import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';

const FilterDropdown = ({ label, options, selectedValues, onChange, type = 'checkbox' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCheckboxChange = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];

    onChange(newValues);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-[6px] border border-gray-300 
                   rounded-md bg-[#F3F3F3] text-sm text-black"
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform 
          ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-64 bg-white border border-gray-200 
                        rounded-md shadow-md z-50 p-2 max-h-72 overflow-y-auto">
          {type === 'checkbox' && options?.map((option) => (
            <label key={option} className="flex items-center gap-2 p-2 text-sm cursor-pointer 
                                          hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="w-4 h-4"
              />
              {option}
            </label>
          ))}

          {type === 'range' && (
            <div className="space-y-2 p-1">
              <input
                type="number"
                placeholder="Min"
                value={selectedValues.min || ''}
                onChange={(e) => onChange({ ...selectedValues, min: e.target.value })}
                className="w-full px-3 py-[6px] border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={selectedValues.max || ''}
                onChange={(e) => onChange({ ...selectedValues, max: e.target.value })}
                className="w-full px-3 py-[6px] border border-gray-300 rounded-md text-sm"
              />
            </div>
          )}

          {type === 'dateRange' && (
            <div className="space-y-2 p-1">
              <input
                type="date"
                value={selectedValues.start || ''}
                onChange={(e) => onChange({ ...selectedValues, start: e.target.value })}
                className="w-full px-3 py-[6px] border border-gray-300 rounded-md text-sm"
              />
              <input
                type="date"
                value={selectedValues.end || ''}
                onChange={(e) => onChange({ ...selectedValues, end: e.target.value })}
                className="w-full px-3 py-[6px] border border-gray-300 rounded-md text-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({
  filters,
  filterOptions,
  onFilterChange,
  onRefresh,
  sortBy,
  sortOrder,
  onSortChange
}) => {

  const handleSort = (e) => {
    const [field, order] = e.target.value.split('-');
    onSortChange(field, order);
  };

  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">

      {/* Refresh */}
      <button
        onClick={onRefresh}
        className="p-[6px] border border-gray-300 rounded-md bg-[#F3F3F3]
                   hover:bg-gray-50"
      >
        <RefreshCw className="w-4 h-4 text-gray" />
      </button>

      {/* Dropdowns */}
      <FilterDropdown
        label="Customer Region"
        options={filterOptions.regions}
        selectedValues={filters.customerRegion}
        onChange={(v) => onFilterChange("customerRegion", v)}
      />

      <FilterDropdown
        label="Gender"
        options={filterOptions.genders}
        selectedValues={filters.gender}
        onChange={(v) => onFilterChange("gender", v)}
      />

      <FilterDropdown
        label="Age Range"
        selectedValues={filters.ageRange}
        onChange={(v) => onFilterChange("ageRange", v)}
        type="range"
      />

      <FilterDropdown
        label="Product Category"
        options={filterOptions.categories}
        selectedValues={filters.productCategory}
        onChange={(v) => onFilterChange("productCategory", v)}
      />

      <FilterDropdown
        label="Tags"
        options={filterOptions.tags}
        selectedValues={filters.tags}
        onChange={(v) => onFilterChange("tags", v)}
      />

      <FilterDropdown
        label="Payment Method"
        options={filterOptions.paymentMethods}
        selectedValues={filters.paymentMethod}
        onChange={(v) => onFilterChange("paymentMethod", v)}
      />

      <FilterDropdown
        label="Date"
        selectedValues={filters.dateRange}
        onChange={(v) => onFilterChange("dateRange", v)}
        type="dateRange"
      />

      <div className="ml-auto">
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={handleSort}
          className="px-3 py-[6px] border border-gray-300 bg-[#F3F3F3] rounded-md text-sm
                     focus:outline-none"
        >
          <option value="customerName-asc">Sort by: Customer Name (A-Z)</option>
          <option value="customerName-desc">Sort by: Customer Name (Z-A)</option>
          <option value="date-desc">Sort by: Date (Newest First)</option>
          <option value="date-asc">Sort by: Date (Oldest First)</option>
          <option value="quantity-desc">Sort by: Quantity (High to Low)</option>
          <option value="quantity-asc">Sort by: Quantity (Low to High)</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
