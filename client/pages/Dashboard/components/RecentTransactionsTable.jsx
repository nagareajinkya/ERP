import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Download, Edit, Trash2, Printer } from 'lucide-react';

/**
 * RecentTransactionsTable Component
 * Displays recent transaction history with search, filters, and inline actions
 * 
 * @param {Array} transactions - Transaction list
 * @param {Function} onViewAll - Navigate to full history handler (optional)
 * @param {Number} maxRows - Limit displayed rows (default: 10)
 * @param {Function} onEdit - Edit transaction handler (optional)
 * @param {Function} onDelete - Delete transaction handler (optional)
 * @param {Function} onPrint - Print transaction handler (optional)
 */
const RecentTransactionsTable = ({
    transactions = [],
    onViewAll,
    maxRows = 10,
    onEdit,
    onDelete,
    onPrint
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all | Sale | Purchase
    const [filterStatus, setFilterStatus] = useState('all'); // all | Paid | Pending
    const [hoveredRow, setHoveredRow] = useState(null);

    // Filtered and searched transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(trx => trx.type === filterType);
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(trx => trx.status === filterStatus);
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(trx =>
                trx.id?.toLowerCase().includes(query) ||
                trx.customer?.toLowerCase().includes(query)
            );
        }

        // Limit rows
        return filtered.slice(0, maxRows);
    }, [transactions, filterType, filterStatus, searchQuery, maxRows]);

    // Calculate summary stats
    const summary = useMemo(() => {
        const sales = filteredTransactions.filter(t => t.type === 'Sale');
        const purchases = filteredTransactions.filter(t => t.type === 'Purchase');

        const totalSales = sales.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalPurchases = purchases.reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
            totalSales,
            totalPurchases,
            netAmount: totalSales - totalPurchases
        };
    }, [filteredTransactions]);

    const handleRowClick = (transaction) => {
        // Navigate to transaction detail view
        if (onEdit) {
            onEdit(transaction);
        }
    };

    const handleAction = (action, transaction, e) => {
        e.stopPropagation();

        switch (action) {
            case 'edit':
                onEdit && onEdit(transaction);
                break;
            case 'delete':
                if (window.confirm(`Delete transaction ${transaction.id}?`)) {
                    onDelete && onDelete(transaction);
                }
                break;
            case 'print':
                onPrint && onPrint(transaction);
                break;
            default:
                break;
        }
    };

    const exportToCSV = () => {
        const headers = ['Transaction ID', 'Party', 'Type', 'Time', 'Status', 'Amount'];
        const rows = filteredTransactions.map(trx => [
            trx.id,
            trx.customer,
            trx.type,
            trx.time,
            trx.status,
            trx.amount
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                    <p className="text-xs text-gray-400 mt-1">
                        Showing {filteredTransactions.length} of {transactions.length} transactions
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 md:flex-none">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search transactions..."
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 w-full md:w-64"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 cursor-pointer bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="Sale">Sales</option>
                        <option value="Purchase">Purchases</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 cursor-pointer bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </select>

                    {/* Export Button */}
                    <button
                        onClick={exportToCSV}
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                        title="Export to CSV"
                    >
                        <Download size={16} />
                        Export
                    </button>

                    {/* View All Button */}
                    {onViewAll && (
                        <button
                            onClick={onViewAll}
                            className="px-4 py-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                        >
                            See all history
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards (visible when filters active) */}
            {(filterType !== 'all' || filterStatus !== 'all' || searchQuery) && (
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Sales</p>
                        <p className="text-lg font-bold text-green-600">₹{summary.totalSales.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Purchases</p>
                        <p className="text-lg font-bold text-red-600">₹{summary.totalPurchases.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Net Amount</p>
                        <p className={`text-lg font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {summary.netAmount >= 0 ? '+' : ''}₹{summary.netAmount.toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="pb-4">Transaction ID</th>
                            <th className="pb-4">Party</th>
                            <th className="pb-4">Type</th>
                            <th className="pb-4">Time</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Amount</th>
                            <th className="pb-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((trx, index) => (
                                <tr
                                    key={index}
                                    onMouseEnter={() => setHoveredRow(index)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onClick={() => handleRowClick(trx)}
                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                >
                                    <td className="py-4 font-bold text-gray-800">{trx.id}</td>
                                    <td className="py-4 font-medium text-gray-600">{trx.customer}</td>
                                    <td className="py-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trx.type === 'Sale'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-red-50 text-red-700'
                                                }`}
                                        >
                                            {trx.type === 'Sale' ? (
                                                <ArrowUpRight size={14} />
                                            ) : (
                                                <ArrowDownRight size={14} />
                                            )}
                                            {trx.type}
                                        </span>
                                    </td>
                                    <td className="py-4 text-gray-400 font-medium">{trx.time}</td>
                                    <td className="py-4">
                                        <span
                                            className={`px-2 py-1 rounded-md text-xs font-bold ${trx.status === 'Paid'
                                                    ? 'text-emerald-600 bg-emerald-50'
                                                    : 'text-amber-600 bg-amber-50'
                                                }`}
                                        >
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td
                                        className={`py-4 text-right font-extrabold ${trx.type === 'Sale' ? 'text-green-600' : 'text-gray-800'
                                            }`}
                                    >
                                        {trx.type === 'Sale' ? '+' : '-'} ₹{trx.amount.toLocaleString()}
                                    </td>
                                    <td className="py-4">
                                        <div className={`flex items-center justify-center gap-1 transition-opacity ${hoveredRow === index ? 'opacity-100' : 'opacity-0'
                                            }`}>
                                            {onPrint && (
                                                <button
                                                    onClick={(e) => handleAction('print', trx, e)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                                                    title="Print"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={(e) => handleAction('edit', trx, e)}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={(e) => handleAction('delete', trx, e)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-400">
                                    <p className="text-sm font-medium">
                                        {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                                            ? 'No transactions match your filters'
                                            : 'No recent transactions'}
                                    </p>
                                    {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterType('all');
                                                setFilterStatus('all');
                                            }}
                                            className="mt-2 text-xs text-green-600 hover:text-green-700 font-bold"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentTransactionsTable;
