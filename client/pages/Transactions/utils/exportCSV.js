import { formatDateForExport } from './dateHelpers';
import { calculateDueAmount } from './formatters';

/**
 * Export transactions to CSV format
 */
export const exportTransactionsCSV = (transactions, filterType, dateFilter) => {
    // Prepare CSV headers
    const headers = [
        'Transaction ID',
        'Type',
        'Party',
        'Date',
        'Time',
        'Products',
        'Payment Mode',
        'Payment Status',
        'Amount',
        'Paid Amount',
        'Due Amount'
    ];

    // Convert filtered data to CSV rows
    const rows = transactions.map(trx => [
        trx.id,
        trx.type,
        trx.party,
        trx.date,
        trx.time || '',
        trx.products,
        trx.paymentMode,
        trx.status,
        trx.amount,
        trx.paidAmount || 0,
        calculateDueAmount(trx)
    ]);

    // Escape special characters and commas in cell data
    const escapeCSVCell = (cell) => {
        if (cell === null || cell === undefined) return '""';
        const cellStr = String(cell);
        // If cell contains comma, quote, or newline, wrap in quotes and escape quotes
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return `"${cellStr}"`;
    };

    // Create CSV content
    const csvContent = [
        headers.map(escapeCSVCell).join(','),
        ...rows.map(row => row.map(escapeCSVCell).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with current date and filters
    const dateStr = formatDateForExport();
    const filename = `transactions_${filterType}_${dateFilter}_${dateStr}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
};
