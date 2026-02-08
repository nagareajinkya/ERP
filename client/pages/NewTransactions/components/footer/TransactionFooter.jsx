import React from 'react';
import { useNewTransactionContext } from '../../context/NewTransactionContext';

/**
 * Transaction footer with totals and paid amount
 */
const TransactionFooter = () => {
    const {
        totals,
        paidAmount, setPaidAmount,
        paymentMode, setPaymentMode,
        notes, setNotes,
        theme,
        handleShowQR
    } = useNewTransactionContext();

    const balanceDue = Math.round(totals.total - (Number(paidAmount) || 0));

    const paymentModes = [
        { id: 'CASH', label: 'Cash' },
        { id: 'UPI', label: 'UPI' },
        { id: 'BANK_TRANSFER', label: 'Bank' },
        { id: 'CHEQUE', label: 'Cheque' }
    ];

    return (
        <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="flex justify-between items-center h-12">
                {/* Left: Totals & Paid Amount */}
                <div className="flex items-center gap-6">
                    <div className="text-sm">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Subtotal</span>
                        <span className="font-bold text-gray-700">₹{totals.sub.toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Discount</span>
                        <span className="font-bold text-red-500">- ₹{totals.disc.toLocaleString()}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>

                    {/* Paid Amount */}
                    <div className="flex flex-col">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Paid Amount</span>
                        <div className="relative">
                            <span className="absolute left-2 top-1.5 text-gray-400 text-xs">₹</span>
                            <input
                                type="number"
                                min="0"
                                value={paidAmount}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val < 0) return;
                                    setPaidAmount(val);
                                }}
                                className={`w-28 pl-5 pr-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-opacity-20 ${theme.borderFocus} focus:ring-current`}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Payment Mode Capsules */}
                    <div className="flex flex-col">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Mode</span>
                        <div className="flex gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-100">
                            {paymentModes.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setPaymentMode(mode.id)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${paymentMode === mode.id
                                        ? `${theme.primary} text-white shadow-sm`
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                                        }`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                        {paymentMode === 'UPI' && useNewTransactionContext().isSale && (
                            <button
                                onClick={handleShowQR}
                                className="mt-1 text-[10px] font-bold text-blue-600 hover:underline text-right"
                            >
                                Show QR
                            </button>
                        )}
                    </div>

                    {/* Notes Field */}
                    <div className="flex flex-col flex-1 min-w-[200px]">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Notes</span>
                        <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Add memo..."
                            className={`w-full px-3 py-1 bg-gray-50 border border-gray-200 rounded text-sm outline-none transition-all focus:ring-2 focus:ring-opacity-20 ${theme.borderFocus} focus:ring-current`}
                        />
                    </div>
                </div>

                {/* Right: Grand Total & Balance Due */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Grand Total</span>
                        <span className="text-2xl font-black text-gray-800">₹{totals.total.toLocaleString()}</span>
                    </div>

                    <div
                        className={`px-4 py-2 rounded-xl text-right flex flex-col justify-center min-w-[120px] ${balanceDue > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}
                    >
                        <span className="block text-[10px] font-bold uppercase opacity-70">Balance Due</span>
                        <span className="text-lg font-bold">₹{balanceDue.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionFooter;
