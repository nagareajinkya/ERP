import React from 'react';
import { DollarSign, Banknote, CreditCard, Landmark, FileText } from 'lucide-react';
import { useNewSettlementContext } from '../../context/NewSettlementContext';

const SettlementForm = () => {
    const {
        amount, setAmount,
        paymentMode, setPaymentMode,
        referenceNumber, setReferenceNumber,
        notes, setNotes,
        theme
    } = useNewSettlementContext();

    const paymentModes = [
        { value: 'CASH', label: 'Cash', icon: Banknote },
        { value: 'UPI', label: 'UPI', icon: DollarSign },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Landmark },
        { value: 'CHEQUE', label: 'Cheque', icon: CreditCard }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-700">Payment Details</h3>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Amount Input - Prominent */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Settlement Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl group-focus-within:text-gray-600">₹</span>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all font-bold text-3xl text-gray-800 ${theme.borderFocus} focus:ring-4 focus:ring-opacity-10 focus:ring-current`}
                            required
                        />
                    </div>
                </div>

                {/* Payment Mode Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {paymentModes.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = paymentMode === mode.value;
                            return (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => setPaymentMode(mode.value)}
                                    className={`p-4 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center gap-3 h-24 ${isSelected
                                        ? `${theme.light} ${theme.border} ${theme.text}`
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={24} className={isSelected ? 'scale-110 transition-transform' : ''} />
                                    {mode.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Reference Number */}
                <div className={`transition-all duration-300 ${paymentMode === 'CASH' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reference Number <span className="text-xs text-gray-400 font-normal">(UPI Ref / Cheque No.)</span>
                    </label>
                    <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Enter reference number"
                        disabled={paymentMode === 'CASH'}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all ${theme.borderFocus} focus:ring-2 focus:ring-opacity-20 focus:ring-current`}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        Notes <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any remarks..."
                        rows="3"
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all resize-none ${theme.borderFocus} focus:ring-2 focus:ring-opacity-20 focus:ring-current`}
                    />
                </div>
            </div>
        </div>
    );
};

export default SettlementForm;
