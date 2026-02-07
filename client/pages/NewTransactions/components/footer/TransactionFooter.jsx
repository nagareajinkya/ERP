import React from 'react';
import { useNewTransactionContext } from '../../context/NewTransactionContext';

/**
 * Transaction footer with totals and paid amount
 */
const TransactionFooter = () => {
    const { totals, paidAmount, setPaidAmount } = useNewTransactionContext();

    const balanceDue = Math.round(totals.total - (Number(paidAmount) || 0));

    return (
        <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            {/* Left: Subtotal, Discount, Paid Amount */}
            <div className="flex items-center gap-8">
                <div className="text-sm">
                    <span className="text-gray-400 block text-xs uppercase mb-0.5">Subtotal</span>
                    <span className="font-bold text-gray-700">₹{totals.sub.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                    <span className="text-gray-400 block text-xs uppercase mb-0.5">Discount</span>
                    <span className="font-bold text-red-500">- ₹{totals.disc.toLocaleString()}</span>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div>
                    <span className="text-gray-400 block text-xs uppercase mb-0.5">Paid Amount</span>
                    <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-400 text-xs">₹</span>
                        <input
                            type="number"
                            value={paidAmount}
                            onChange={e => setPaidAmount(e.target.value)}
                            className="w-32 pl-5 pr-2 py-1 bg-gray-100 border-none rounded text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Right: Grand Total & Balance Due */}
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <span className="text-gray-400 block text-xs uppercase mb-0.5">Grand Total</span>
                    <span className="text-2xl font-black text-gray-800">₹{totals.total.toLocaleString()}</span>
                </div>

                <div
                    className={`px-4 py-2 rounded-xl text-right ${balanceDue > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}
                >
                    <span className="block text-[10px] font-bold uppercase opacity-70">Balance Due</span>
                    <span className="text-lg font-bold">₹{balanceDue.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionFooter;
