import React from 'react';
import { Plus } from 'lucide-react';

/**
 * DashboardHeader Component
 * Header section with title, description, and action buttons
 * 
 * @param {Function} onNewPurchase - Handler for "Add Purchase" button
 * @param {Function} onNewSale - Handler for "New Sale" button
 */
const DashboardHeader = ({ onNewPurchase, onNewSale }) => {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
                <p className="text-sm text-gray-500 font-medium">
                    Here's what's happening in your store today.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onNewPurchase}
                    className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                    Add Purchase
                </button>

                <button
                    onClick={onNewSale}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]"
                >
                    <Plus size={18} />
                    New Sale
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
