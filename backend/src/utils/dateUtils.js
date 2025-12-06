const parseDate = (dateString) => {
  if (!dateString) return null;

  // Handle DD-MM-YYYY format
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }

  // Fallback to standard parsing
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const compareDates = (date1, date2) => {
  if (!date1 && !date2) return 0;
  if (!date1) return 1;
  if (!date2) return -1;
  return date1.getTime() - date2.getTime();
};

const formatDate = (date) => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

module.exports = {
  parseDate,
  compareDates,
  formatDate
};