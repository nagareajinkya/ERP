import React from 'react';
import ExportDropdown from './ExportDropdown';

/**
 * Transactions page header with title and export functionality
 */
const TransactionsHeader = () => {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
                <p className="text-sm text-gray-500 font-medium">
                    History of all sales, purchases, and adjustments.
                </p>
            </div>
            <div className="flex gap-3">
                <ExportDropdown />
            </div>
        </div>
    );
};

export default TransactionsHeader;
