import React, { memo, useMemo } from 'react';
import { List } from 'react-window';
import { useTransactionsContext } from '../context/TransactionsContext';
import TransactionRow from './TransactionRow';
import { EMPTY_STATE_MESSAGE } from '../utils/constants';

/**
 * Virtualized Row wrapper for TransactionRow
 * In react-window v2.x, this is passed as the rowComponent prop
 */
const VirtualRow = memo(({ index, style, data }) => {
    const transaction = data[index];
    if (!transaction) return null;

    return (
        <div style={style}>
            <table className="w-full text-left border-collapse table-fixed">
                <tbody className="text-sm">
                    <TransactionRow transaction={transaction} />
                </tbody>
            </table>
        </div>
    );
});

VirtualRow.displayName = 'VirtualRow';

/**
 * Transactions table component with Virtualization
 * Uses react-window v2.x for efficient rendering of large lists
 */
const TransactionsTable = () => {
    const { transactions, loading, isFetching } = useTransactionsContext();

    // Memoize row props to avoid unnecessary list re-renders
    const rowProps = useMemo(() => ({ data: transactions }), [transactions]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)]">
            {/* Table Header */}
            <div className="overflow-x-auto overflow-y-hidden relative">
                {/* Background fetching indicator */}
                {isFetching && !loading && (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-2 text-[10px] font-bold text-green-600 animate-pulse bg-green-50 px-2 py-1 rounded-full border border-green-100 z-20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        REFRESHING...
                    </div>
                )}
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                            <th className="py-4 px-6 w-[15%]">Transaction</th>
                            <th className="py-4 px-6 w-[25%]">Party / Details</th>
                            <th className="py-4 px-6 w-[20%]">Date & Time</th>
                            <th className="py-4 px-6 text-center w-[15%]">Payment</th>
                            <th className="py-4 px-6 text-right w-[15%]">Amount</th>
                            <th className="py-4 px-6 text-center w-[10%]">Action</th>
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Virtualized Body */}
            <div className="flex-1 overflow-x-auto">
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex space-x-4">
                                <div className="flex-1 h-12 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : transactions.length > 0 ? (
                    <List
                        height={500} // This will be managed by flex-1 container usually, but FixedSizeList needs a height
                        rowCount={transactions.length}
                        rowHeight={84} // Estimated height of TransactionRow
                        width="100%"
                        rowComponent={VirtualRow}
                        rowProps={rowProps}
                        className="scrollbar-hide"
                    />
                ) : (
                    <div className="p-8 text-center text-gray-400 font-medium">
                        {EMPTY_STATE_MESSAGE}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsTable;
