import React, { useState, useEffect } from 'react';
import api from '../../src/api';
import SettlementModal from './SettlementModal';
import {
    Phone, ArrowDownLeft, Receipt, MessageCircle,
    Edit2, Trash2, MapPin, ArrowUpRight, UserCircle2, Building2, Loader2
} from 'lucide-react';

const PartyDetailView = ({ party, onBack, onEdit, onDelete }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSettlementModal, setShowSettlementModal] = useState(null); // null, 'receipt', or 'payment'

    useEffect(() => {
        if (party?.id) {
            fetchTransactions(party.id);
        }
    }, [party]);

    const fetchTransactions = async (partyId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/trading/transactions/party/${partyId}`);
            setTransactions(response.data.data || []);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError("Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    const handleSettlementSuccess = () => {
        // Refresh transactions and party data
        fetchTransactions(party.id);
        // Optionally trigger a parent refresh to update party balance
        window.location.reload(); // Simple approach - could be optimized
    };

    if (!party) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 font-sans animate-in slide-in-from-right-4 duration-300">

            {/* 1. HEADER & BACK BUTTON */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm text-gray-600">
                    <ArrowDownLeft className="rotate-45" size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {party.name}
                        <span className={`text-[10px] px-2 py-1 rounded-full text-white uppercase tracking-wider ${party.type === 0 ? 'bg-blue-600' : 'bg-purple-600'}`}>
                            {party.type === 0 ? 'Customer' : 'Supplier'}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium flex gap-4 mt-1">
                        <span className="flex items-center gap-1"><Phone size={14} /> {party.phoneNumber}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {party.city}</span>
                    </p>
                </div>

                {/* Top Right Balance Card */}
                <div className={`ml-auto px-6 py-3 rounded-2xl border ${party.currentBalance > 0 ? 'bg-green-50 border-green-100 text-green-700' : party.currentBalance < 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Balance</p>
                    <p className="text-2xl font-black">₹{Math.abs(party.currentBalance).toLocaleString()}</p>
                </div>
            </div>

            {/* 2. MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: TRANSACTION HISTORY TABLE */}
                <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[70vh]">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Receipt size={18} className="text-blue-600" /> Transaction History</h3>
                        <div className="flex gap-2">
                            <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Download PDF</button>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-5 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                        <div>Date</div>
                        <div className="col-span-2">Details</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Status</div>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto p-0">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {transactions.map((t) => (
                                    <div key={t.id} className="grid grid-cols-5 px-6 py-4 hover:bg-gray-50 transition-colors items-center text-sm">
                                        <div className="font-bold text-gray-600">
                                            {t.date}
                                            <span className="block text-[10px] text-gray-400 font-normal">{t.time}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="font-bold text-gray-800">{t.products} Items</p>
                                            <p className="text-xs text-gray-400 truncate w-3/4">
                                                {t.details.map(d => d.name).join(', ')}
                                            </p>
                                        </div>
                                        <div className="text-right font-black text-gray-800">
                                            ₹{t.amount.toLocaleString()}
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                t.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Receipt size={32} className="opacity-20" />
                                </div>
                                <p className="text-sm font-medium">No transactions found yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: QUICK ACTIONS PANEL */}
                <div className="space-y-4">

                    {/* Action Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {/* Settlement Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        setShowSettlementModal(true);
                                        // We'll need to pass the mode to the modal. 
                                        // I'll update the state to include mode.
                                    }}
                                    className="col-span-2 hidden" // Placeholder to remove old logic safely
                                />
                                <button
                                    onClick={() => {
                                        setShowSettlementModal('receipt');
                                    }}
                                    className="py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
                                >
                                    <ArrowDownLeft size={24} />
                                    <span>Record Receipt</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSettlementModal('payment');
                                    }}
                                    className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
                                >
                                    <ArrowUpRight size={24} />
                                    <span>Record Payment</span>
                                </button>
                            </div>
                            <button className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                <Receipt size={20} /> Create New {party.type === 0 ? 'Sale' : 'Purchase'}
                            </button>
                        </div>
                    </div>

                    {/* Communication Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Communication</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => alert('WhatsApp')} className="p-4 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors flex flex-col items-center gap-2">
                                <MessageCircle size={24} /> <span className="text-xs">WhatsApp</span>
                            </button>
                            <button className="p-4 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center gap-2">
                                <Phone size={24} /> <span className="text-xs">Call</span>
                            </button>
                        </div>
                    </div>

                    {/* Management Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <button onClick={(e) => onEdit(party, e)} className="w-full py-3 mb-2 flex items-center gap-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl px-4 transition-colors">
                            <Edit2 size={18} /> Edit Profile
                        </button>
                        <button onClick={() => onDelete(party.id)} className="w-full py-3 flex items-center gap-3 text-red-500 font-bold hover:bg-red-50 rounded-xl px-4 transition-colors">
                            <Trash2 size={18} /> Delete Party
                        </button>
                    </div>
                </div>
            </div>

            {/* Settlement Modal */}
            <SettlementModal
                isOpen={!!showSettlementModal}
                onClose={() => setShowSettlementModal(null)}
                party={party}
                initialMode={showSettlementModal === 'receipt' ? 'receipt' : 'payment'} // Default if just true is passed, but we use string now
                onSuccess={handleSettlementSuccess}
            />
        </div>
    );
};

export default PartyDetailView;
