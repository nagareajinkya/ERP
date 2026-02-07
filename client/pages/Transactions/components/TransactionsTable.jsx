import React from 'react';
import { useTransactionsContext } from '../context/TransactionsContext';
import TransactionRow from './TransactionRow';
import { EMPTY_STATE_MESSAGE } from '../utils/constants';

/**
 * Transactions table component
 */
const TransactionsTable = () => {
    const { transactions, loading } = useTransactionsContext();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                            <th className="py-4 px-6">Transaction</th>
                            <th className="py-4 px-6">Party / Details</th>
                            <th className="py-4 px-6">Date & Time</th>
                            <th className="py-4 px-6 text-center">Payment</th>
                            <th className="py-4 px-6 text-right">Amount</th>
                            <th className="py-4 px-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                        {loading ? (
                            // Loading skeleton
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6" colSpan="6">
                                            <div className="h-12 bg-gray-100 rounded"></div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ) : transactions.length > 0 ? (
                            transactions.map((trx) => (
                                <TransactionRow key={trx.id} transaction={trx} />
                            ))
                        ) : null}
                    </tbody>
                </table>

                {!loading && transactions.length === 0 && (
                    <div className="p-8 text-center text-gray-400 font-medium">
                        {EMPTY_STATE_MESSAGE}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsTable;
