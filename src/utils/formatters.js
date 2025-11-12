// Formatting utility functions for dates and currency

/**
 * Format date in simple numeric format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (e.g., "2025/09/28")
 */
export const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  // Return in YYYY/MM/DD format
  return `${year}/${month}/${day}`;
};

/**
 * Format date and time in simple numeric format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string (e.g., "2025/09/28 14:30")
 */
export const formatDateTime = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  // Return in YYYY/MM/DD HH:MM format
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

/**
 * Format currency to Algerian Dinar
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "-";
  return new Intl.NumberFormat("ar-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(amount);
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};
