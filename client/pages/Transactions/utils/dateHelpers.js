/**
 * Date utility functions for transaction filtering and formatting
 */

// Get today's date range (start of day to end of day)
export const getTodayRange = () => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    return { start, end };
};

// Get yesterday's date range
export const getYesterdayRange = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday.setHours(0, 0, 0, 0));
    const end = new Date(yesterday.setHours(23, 59, 59, 999));
    return { start, end };
};

// Get this week's date range (last 7 days)
export const getWeekRange = () => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const start = new Date(weekAgo.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    return { start, end };
};

// Get this month's date range (from 1st of month to today)
export const getMonthRange = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const start = new Date(monthStart.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    return { start, end };
};

// Get date range based on filter string
export const getDateRangeForFilter = (filter) => {
    switch (filter) {
        case 'Today':
            return getTodayRange();
        case 'Yesterday':
            return getYesterdayRange();
        case 'This Week':
            return getWeekRange();
        case 'This Month':
            return getMonthRange();
        case 'All Time':
            return { start: null, end: null };
        default:
            return { start: null, end: null };
    }
};

// Format date for file exports (YYYY-MM-DD)
export const formatDateForExport = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

// Format date for UI display (DD Mon YYYY)
export const formatDateForDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Format time for UI display (HH:MM AM/PM)
export const formatTimeForDisplay = (time) => {
    if (!time) return '';
    return time;
};

// Generate human-readable date range text for exports and display
export const formatDateRangeText = (filter, customRange = null) => {
    if (filter === 'All Time') {
        return 'All Time';
    }

    if (filter === 'Today') {
        return formatDateForDisplay(new Date());
    }

    if (filter === 'Yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return formatDateForDisplay(yesterday);
    }

    if (filter === 'This Week') {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return `${weekAgo.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }

    if (filter === 'This Month') {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return `${monthStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }

    if (filter === 'Custom Range' && customRange?.start && customRange?.end) {
        const startDate = new Date(customRange.start);
        const endDate = new Date(customRange.end);
        return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
    }

    return '';
};
