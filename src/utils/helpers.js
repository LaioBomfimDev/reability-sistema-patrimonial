// Utility functions for the asset management system

/**
 * Format currency value to Brazilian Real
 * @param {number} value - The numeric value to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Format date to Brazilian format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
};

/**
 * Format date and time to Brazilian format
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Generate patrimony code (YYYY0001 format)
 * @param {number} lastNumber - The last sequential number
 * @returns {string} - Generated patrimony code
 */
export const generatePatrimonyCode = (lastNumber = 0) => {
  const currentYear = new Date().getFullYear();
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `${currentYear}${nextNumber}`;
};

/**
 * Validate required fields
 * @param {object} data - Object with data to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} - Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = 'Este campo é obrigatório';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate monetary value
 * @param {string|number} value - Value to validate
 * @returns {boolean} - Is valid
 */
export const isValidMonetaryValue = (value) => {
  if (!value) return true; // Optional field
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue >= 0;
};

/**
 * Validate date (not future)
 * @param {string} date - Date to validate
 * @returns {boolean} - Is valid
 */
export const isValidPastDate = (date) => {
  if (!date) return true; // Optional field
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return inputDate <= today;
};

/**
 * Get status color class
 * @param {string} status - Asset status
 * @returns {string} - CSS class name
 */
export const getStatusColorClass = (status) => {
  switch (status) {
    case 'Ativo':
      return 'text-green-800 bg-green-100';
    case 'Inativo':
      return 'text-red-800 bg-red-100';
    case 'Em Manutenção':
      return 'text-yellow-800 bg-yellow-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
};

/**
 * Convert object to CSV format
 * @param {array} data - Array of objects to convert
 * @param {array} headers - Array of header objects with key and label
 * @returns {string} - CSV string
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  
  // Create header row
  const headerRow = headers.map(header => `"${header.label}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      let value = row[header.key];
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      } else if (typeof value === 'number') {
        // Format numbers appropriately
        if (header.key.includes('valor')) {
          value = formatCurrency(value).replace('R$ ', '').replace('.', '').replace(',', '.');
        }
      } else if (value instanceof Date) {
        value = formatDate(value);
      }
      
      return value;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - File name
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Debounce function to limit API calls
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};