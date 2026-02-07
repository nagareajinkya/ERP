import React from 'react';
import { User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useNewSettlementContext } from '../../context/NewSettlementContext';

const PartyBalanceCard = () => {
    const { selectedParty, theme, isReceipt } = useNewSettlementContext();

    if (!selectedParty) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <User size={32} className="opacity-50" />
                </div>
                <p className="font-medium">No {isReceipt ? 'Customer' : 'Supplier'} Selected</p>
                <p className="text-sm mt-1">Search and select a party to proceed</p>
            </div>
        );
    }

    const outstandingBalance = Math.abs(selectedParty.currentBalance || 0);
    const isCredit = selectedParty.currentBalance > 0; // Receivable
    const isDebit = selectedParty.currentBalance < 0; // Payable

    // Determine status color based on context
    // If Receipt (Customer): Positive balance is good (they owe us), 0 is settled
    // If Payment (Supplier): Negative balance is what we owe

    // Actually, generally:
    // Green = Receivable (Asset)
    // Red = Payable (Liability)

    const balanceColor = selectedParty.currentBalance > 0 ? 'text-green-600' : (selectedParty.currentBalance < 0 ? 'text-red-600' : 'text-gray-600');
    const bgTheme = selectedParty.currentBalance > 0 ? 'bg-green-50' : (selectedParty.currentBalance < 0 ? 'bg-red-50' : 'bg-gray-50');

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Balance Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-700">Selected Party</h3>
                </div>

                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedParty.name}</h2>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                <Phone size={14} />
                                <span>{selectedParty.phoneNumber || 'No phone'}</span>
                            </div>
                            {selectedParty.address && (
                                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                    <MapPin size={14} />
                                    <span className="truncate max-w-[200px]">{selectedParty.address}</span>
                                </div>
                            )}
                        </div>
                        <div className={`p-3 rounded-full ${theme.light}`}>
                            <User size={24} className={theme.text} />
                        </div>
                    </div>

                    <div className={`rounded-xl p-5 border ${bgTheme} ${selectedParty.currentBalance > 0 ? 'border-green-100' : 'border-red-100'}`}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Current Outstanding
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black ${balanceColor}`}>
                                ₹{outstandingBalance.toLocaleString()}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCredit ? 'bg-green-100 text-green-700' : (isDebit ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700')}`}>
                                {isCredit ? 'To Receive' : (isDebit ? 'To Pay' : 'Settled')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info / Help Card */}
            <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 flex gap-3 items-start">
                <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-blue-800 mb-1">
                        {isReceipt ? 'Recording Receipt' : 'Recording Payment'}
                    </h4>
                    <p className="text-xs text-blue-600 leading-relaxed">
                        {isReceipt
                            ? "This will reduce the customer's outstanding balance. Ensure you've received the payment before recording."
                            : "This will reduce your outstanding debt to the supplier. Ensure the payment has been initiated."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PartyBalanceCard;
