import { toast } from "react-toastify";

// Toast configuration defaults
const defaultOptions = {
  position: "top-left", // Top-left for RTL (Arabic)
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  rtl: true, // Enable RTL for Arabic
};

/**
 * Show success toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional toast options
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Show error toast notification
 * @param {string} message - The error message to display
 * @param {object} options - Additional toast options
 */
export const showError = (message, options = {}) => {
  toast.error(message, {
    ...defaultOptions,
    autoClose: 5000, // Keep errors visible longer
    ...options,
  });
};

/**
 * Show warning toast notification
 * @param {string} message - The warning message to display
 * @param {object} options - Additional toast options
 */
export const showWarning = (message, options = {}) => {
  toast.warning(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Show info toast notification
 * @param {string} message - The info message to display
 * @param {object} options - Additional toast options
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Show a loading toast that can be updated later
 * @param {string} message - The loading message to display
 * @returns {number|string} Toast ID for updating the toast later
 */
export const showLoading = (message = "جاري التحميل...") => {
  return toast.loading(message, {
    ...defaultOptions,
  });
};

/**
 * Update an existing toast
 * @param {number|string} toastId - The ID of the toast to update
 * @param {object} options - Toast update options
 */
export const updateToast = (toastId, options) => {
  toast.update(toastId, {
    ...defaultOptions,
    isLoading: false,
    ...options,
  });
};

/**
 * Dismiss a specific toast or all toasts
 * @param {number|string} toastId - Optional toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

// Export the toast object for advanced usage
export { toast };
