export const getActiveFilterCount = (filters) => {
  let count = 0;
  if (filters.customerRegion.length > 0) count++;
  if (filters.gender.length > 0) count++;
  if (filters.ageRange.min || filters.ageRange.max) count++;
  if (filters.productCategory.length > 0) count++;
  if (filters.tags.length > 0) count++;
  if (filters.paymentMethod.length > 0) count++;
  if (filters.dateRange.start || filters.dateRange.end) count++;
  return count;
};

export const getInitialFilters = () => ({
  customerRegion: [],
  gender: [],
  ageRange: { min: '', max: '' },
  productCategory: [],
  tags: [],
  paymentMethod: [],
  dateRange: { start: '', end: '' }
});