/**
 * Formatting utilities
 */

/**
 * Format number as currency (Indian Rupee)
 */
export const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString()}`;
};

/**
 * Format date to local date string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 */
export const formatDateForInput = (date = new Date()) => {
    return new Date(date).toLocaleDateString('en-CA');
};
