import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTransactionsContext } from '../context/TransactionsContext';
import { formatCurrency } from '../utils/formatters';

/**
 * Footer component showing transaction totals
 */
const TransactionsFooter = () => {
    const { totalCredit, totalDebit, netBalance } = useTransactionsContext();

    return (
        <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 rounded-t-lg shadow-lg mt-6">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">

                {/* Credit */}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                    <ArrowUpRight size={16} className="text-green-500" />
                    <span>Credit</span>
                    <span className="text-green-600 font-bold">
                        {formatCurrency(totalCredit)}
                    </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-6 w-px bg-gray-200" />

                {/* Debit */}
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                    <ArrowDownRight size={16} className="text-red-500" />
                    <span>Debit</span>
                    <span className="text-red-600 font-bold">
                        {formatCurrency(totalDebit)}
                    </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-6 w-px bg-gray-200" />

                {/* Net Balance */}
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-gray-500">Net</span>
                    <span
                        className={`font-extrabold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}
                    >
                        {netBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalance))}
                    </span>
                </div>

            </div>
        </div>
    );
};

export default TransactionsFooter;
