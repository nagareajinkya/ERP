import React from 'react';
import {
    Phone, ArrowDownLeft, Receipt, MessageCircle,
    Edit2, Trash2, MapPin, ArrowUpRight, UserCircle2, Building2
} from 'lucide-react';

const PartyDetailView = ({ party, onBack, onEdit, onDelete }) => {
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
                    <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                        <div>Date</div>
                        <div>Details</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Status</div>
                    </div>

                    {/* Empty State / Table Body */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Receipt size={32} className="opacity-20" />
                        </div>
                        <p className="text-sm font-medium">No transactions found yet.</p>
                        <button className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors">
                            Create First Invoice
                        </button>
                    </div>
                </div>

                {/* RIGHT: QUICK ACTIONS PANEL */}
                <div className="space-y-4">

                    {/* Action Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                <ArrowDownLeft size={20} /> Collect Payment
                            </button>
                            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                <Receipt size={20} /> Create New Sale
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
        </div>
    );
};

export default PartyDetailView;
