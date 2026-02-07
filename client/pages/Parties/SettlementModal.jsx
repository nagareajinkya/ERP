import React, { useState, useEffect } from 'react';
import { X, DollarSign, Banknote, CreditCard, Landmark, FileText, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import api from '../../src/api';
import { useUI } from '../../context/UIContext';

const SettlementModal = ({ isOpen, onClose, party, onSuccess, initialMode = 'receipt' }) => {
    const [mode, setMode] = useState(initialMode);
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { refreshStats } = useUI();

    // Reset and sync state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode || 'receipt');
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            setAmount('');
            setPaymentMode('CASH');
            setReferenceNumber('');
            setNotes('');
            setError(null);
        }
    }, [isOpen, initialMode]);

    if (!isOpen || !party) return null;

    const isReceipt = mode === 'receipt';
    const theme = isReceipt ? {
        primary: 'bg-green-600',
        primaryHover: 'hover:bg-green-700',
        light: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        borderFocus: 'focus:border-green-500',
        gradient: 'from-green-50 to-emerald-50',
        icon: ArrowDownLeft
    } : {
        primary: 'bg-blue-600',
        primaryHover: 'hover:bg-blue-700',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        borderFocus: 'focus:border-blue-500',
        gradient: 'from-blue-50 to-indigo-50',
        icon: ArrowUpRight
    };

    const outstandingBalance = Math.abs(party.currentBalance || 0);
    // Helper to determine if the balance "matches" the mode (e.g. Receipt for Receivable)
    // If Balance > 0 (Receivable) and Mode is Receipt -> Natural match.
    // If Balance < 0 (Payable) and Mode is Payment -> Natural match.
    const isNaturalFlow = (party.currentBalance >= 0 && isReceipt) || (party.currentBalance <= 0 && !isReceipt);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        // Strict validation: Prevent settling more than duplicate balance?
        // Actually, let's keep the logic simple: Warn but maybe allow?
        // The previous code BLOCKED it. "Amount cannot exceed outstanding balance".
        // But if I am "Receiving" from a supplier (Refund), and balance is 0 (Settled)?
        // Then outstanding is 0. I cannot receive?
        // That blocks refunds. 
        // Let's Relax validation IF it's not a "Natural Flow"? 
        // Or just Relax it completely and show a warning?
        // For now, I will keep the block ONLY if IS NATURAL FLOW?
        // E.g. If I am Receiving from someone who owes me (Natural), I shouldn't Receive more than they owe?
        // Actually, maybe they overpay.
        // Let's remove the BLOCKING validation for flexibility, or make it a soft warning.
        // BUT, user code previously had it. I should stick to it unless it breaks the "Supplier Refunds" case.
        // If Supplier Balance is -1000 (We owe).
        // Refund (Receipt): We get money back. Logic: Balance - (-Amount) ? No Receipt is -Amount.
        // New Balance = -1000 - 500 = -1500 (We owe MORE? No).
        // Wait. Backend Logic: Receipt reduces balance.
        // If we owe -1000. Receipt 500 -> -1500.
        // This direction implies we owe MORE.
        // So Receipt from Supplier -> We owe MORE?
        // That means they gave us money (Loan?).
        // If we returned goods, we should have DEBITED them (Purchase Return Transaction).
        // Purchase Return -> Debit Supplier (Balance + X). (-1000 + 100 = -900).
        // So a Refund (Cash) is NOT handled by Receipt/Payment directly if it's meant to "Reverse" a payment?
        // Payment Reversal?
        // If we Paid 1000. Balance -1000 -> 0.
        // If they refund 1000. We want Balance 0 -> -1000.
        // Receipt (Logic -1000) -> 0 - 1000 = -1000.
        // YES! Receipt does increase debt (payable).
        // So "Refund from Supplier" == Receipt.
        // So the math works!

        // Checking limit:
        // If Balance 0. Outstanding 0.
        // Receipt 1000.
        // `1000 > 0`. Error.
        // So BLOCKING prohibits new loans/refunds on settled accounts.
        // I should REMOVE the strict check or make it smarter.
        // Given the User prompt "Supplier can also owe us", it implies Balance > 0.
        // If Balance > 0 (Receivable). Receipt -> Reduces Balance.
        // `Amount > Outstanding` check makes sense there (don't receive more than owed).
        // So: I will block ONLY if the action reduces the magnitude of balance (Natural Flow).
        // If action INCREASES magnitude (e.g. Receipt on Payable), then ignore limit.

        // Strict validation removed as per user request
        // Users can now record payments/receipts greater than balance (e.g. advance payments)


        setLoading(true);

        try {
            await api.post('/trading/transactions', {
                partyId: party.id,
                partyName: party.name,
                date: date,
                type: isReceipt ? 'RECEIPT' : 'PAYMENT',
                subTotal: amountNum,
                discount: 0,
                totalAmount: amountNum,
                paidAmount: amountNum,
                paymentMode: paymentMode,
                referenceNumber: referenceNumber || null,
                notes: notes || null,
                products: [],
                appliedOffers: []
            });

            onSuccess && onSuccess();
            refreshStats(); // Update Sidebar Stats
            onClose();
        } catch (err) {
            console.error('Settlement error:', err);
            setError('Failed to record settlement.');
        } finally {
            setLoading(false);
        }
    };

    const paymentModes = [
        { value: 'CASH', label: 'Cash', icon: Banknote },
        { value: 'UPI', label: 'UPI', icon: DollarSign },
        { value: 'BANK_TRANSFER', label: 'Bank', icon: Landmark },
        { value: 'CHEQUE', label: 'Cheque', icon: CreditCard }
    ];

    const TitleIcon = theme.icon;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r ${theme.gradient}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-white/80 shadow-sm ${theme.text}`}>
                            <TitleIcon size={24} />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${theme.text}`}>
                                {isReceipt ? 'Record Receipt' : 'Record Payment'}
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{party.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-red-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Switcher */}
                <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setMode('receipt')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isReceipt ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Receipt (In)
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('payment')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isReceipt ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Payment (Out)
                    </button>
                </div>

                {/* Scrollable Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Amount */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-gray-700">Amount</label>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                Bal: ₹{outstandingBalance.toLocaleString()}
                            </span>
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl group-focus-within:text-gray-800">₹</span>
                            <input
                                type="number"
                                step="any"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className={`w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all font-bold text-3xl text-gray-800 ${theme.borderFocus} focus:ring-4 focus:ring-opacity-10 focus:ring-current`}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Payment Mode</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {paymentModes.map((m) => {
                                const Icon = m.icon;
                                const isSelected = paymentMode === m.value;
                                return (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setPaymentMode(m.value)}
                                        className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-2 h-20 ${isSelected
                                            ? `${theme.light} ${theme.border} ${theme.text}`
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={20} className={isSelected ? 'scale-110' : ''} />
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ref & Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`transition-all ${paymentMode === 'CASH' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Reference No</label>
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Ref #"
                                disabled={paymentMode === 'CASH'}
                                className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:bg-white transition-all ${theme.borderFocus}`}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:bg-white transition-all ${theme.borderFocus}`}
                                required
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add remarks..."
                            rows="2"
                            className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:bg-white transition-all resize-none ${theme.borderFocus}`}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                            <p className="text-xs font-bold text-red-600">{error}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-[2] py-3.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${theme.primary} ${theme.primaryHover} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? (
                            'Processing...'
                        ) : (
                            <>
                                <Check size={20} />
                                Confirm {isReceipt ? 'Receipt' : 'Payment'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettlementModal;
