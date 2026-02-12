import React, { useState, useEffect } from 'react';
import {
    UserCircle2, Phone, Map, Hash, Wallet, Banknote, Truck, Building2, CheckCircle2, X
} from 'lucide-react';

// --- HELPER COMPONENT FOR STYLISH INPUTS ---
const InputWithIcon = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={type}
                required={required}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
        </div>
    </div>
);

const PartyFormModal = ({ isOpen, onClose, onSubmit, type, initialData, isEditing }) => {
    if (!isOpen) return null;

    // Type: 'customer' (0) or 'supplier' (1)
    const isCustomer = type === 'customer' || type === 0;

    // Theme Config
    const theme = {
        color: isCustomer ? 'blue' : 'purple',
        gradient: isCustomer ? 'from-blue-50 to-white' : 'from-purple-50 to-white',
        icon: isCustomer ? UserCircle2 : Truck,
        shadow: isCustomer ? 'shadow-blue-200' : 'shadow-purple-200',
        headerBg: isCustomer ? 'bg-blue-600' : 'bg-purple-600',
        headerText: isCustomer ? 'Edit Customer' : 'Edit Supplier',
        headerNewText: isCustomer ? 'Add New Customer' : 'Add New Supplier',
        subText: isCustomer ? 'Enter customer details to track sales & balance.' : 'Manage vendors you purchase goods from.',
        section1Title: isCustomer ? 'Basic Information' : 'Vendor Details',
        nameLabel: isCustomer ? 'Customer / Business Name' : 'Supplier / Agency Name',
        namePlaceholder: isCustomer ? 'e.g. Rahul General Store' : 'e.g. Coca Cola Agency',
        section2Title: isCustomer ? 'Billing Details' : 'Accounts',
        balanceLabel: isCustomer ? 'Opening Balance' : 'Opening Payable',
        balanceIcon: isCustomer ? Wallet : Banknote,
        balanceColor: isCustomer ? 'green' : 'red',
        balanceText: isCustomer ? 'Positive (+) = You will receive money' : 'Negative (-) = You owe money',
    };

    const [form, setForm] = useState({
        name: '',
        phoneNumber: '',
        city: '',
        gstin: '',
        currentBalance: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                phoneNumber: initialData.phoneNumber || '',
                city: initialData.city || '',
                gstin: initialData.gstin || '',
                currentBalance: initialData.currentBalance || '',
                notes: initialData.notes || ''
            });
        } else {
            setForm({ name: '', phoneNumber: '', city: '', gstin: '', currentBalance: '', notes: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className={`px-8 py-6 border-b border-gray-100 bg-gradient-to-r ${theme.gradient} flex justify-between items-center sticky top-0 z-10`}>
                    <div>
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <span className={`p-2 ${theme.headerBg} text-white rounded-lg ${theme.shadow} shadow-lg`}><theme.icon size={20} /></span>
                            {isEditing ? theme.headerText : theme.headerNewText}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium ml-1 mt-1">{theme.subText}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                </div>

                {/* Scrollable Form Body */}
                <div className="overflow-y-auto p-8 custom-scrollbar">
                    <form id="partyForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* Section 1: Basic Identity */}
                        <div className="space-y-4">
                            <h4 className={`text-xs font-bold text-${theme.color}-600 uppercase tracking-widest border-b border-${theme.color}-100 pb-2 mb-4`}>{theme.section1Title}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputWithIcon
                                    label={theme.nameLabel}
                                    icon={isCustomer ? UserCircle2 : Building2}
                                    placeholder={theme.namePlaceholder}
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="md:col-span-2"
                                />
                                <InputWithIcon
                                    label="Phone Number"
                                    icon={Phone}
                                    type="tel"
                                    placeholder="e.g. 98765 43210"
                                    value={form.phoneNumber}
                                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                />
                                <InputWithIcon
                                    label="City / Location"
                                    icon={Map}
                                    placeholder={isCustomer ? "e.g. Andheri, Mumbai" : "e.g. Pune Ind. Estate"}
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Section 2: Financials & Tax */}
                        <div className="space-y-4">
                            <h4 className={`text-xs font-bold text-${theme.color}-600 uppercase tracking-widest border-b border-${theme.color}-100 pb-2 mb-4`}>{theme.section2Title}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputWithIcon
                                    label="GSTIN (Optional)"
                                    icon={Hash}
                                    placeholder="e.g. 27ABCDE1234F1Z5"
                                    value={form.gstin}
                                    onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                                />

                                {!isEditing && isCustomer && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">{theme.balanceLabel}</label>
                                        <div className="relative group">
                                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-${theme.balanceColor}-600`}>
                                                <theme.balanceIcon size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={form.currentBalance}
                                                onChange={e => setForm({ ...form, currentBalance: e.target.value })}
                                                className={`w-full pl-12 pr-4 py-3.5 bg-${theme.balanceColor}-50/50 border border-${theme.balanceColor}-200 rounded-xl font-bold text-${theme.balanceColor}-800 placeholder:text-${theme.balanceColor}-300 focus:bg-white focus:border-${theme.balanceColor}-500 focus:ring-4 focus:ring-${theme.balanceColor}-500/10 outline-none transition-all`}
                                            />
                                            <p className={`text-[10px] text-${theme.balanceColor}-600 font-bold mt-1.5 ml-1`}>{theme.balanceText}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Additional */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Private Notes</label>
                            <textarea
                                rows="3"
                                placeholder="e.g. Usually pays on weekends..."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                            />
                        </div>

                    </form>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                    <button type="submit" form="partyForm" className={`flex-[2] py-4 text-white ${theme.headerBg} hover:opacity-90 font-bold rounded-xl shadow-lg ${theme.shadow} transition-all flex items-center justify-center gap-2`}>
                        <CheckCircle2 size={20} /> {isEditing ? `Update ${isCustomer ? 'Customer' : 'Supplier'}` : `Save ${isCustomer ? 'Customer' : 'Supplier'}`}
                    </button>
                </div>

            </div>
        </div >
    );
};

export default PartyFormModal;
