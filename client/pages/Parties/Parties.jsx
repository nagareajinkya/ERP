import React, { useState, useEffect } from 'react';
import {
  Users, Truck, Search, Plus, MessageCircle,
  Phone, ArrowUpRight, ArrowDownLeft, X, CheckCircle2,
  Receipt, Download, ShieldCheck, Building2, UserCircle2, Wallet, Banknote, Map, Hash,
  Edit2, Trash2, MapPin, FileText, AlertTriangle, Briefcase, Loader2
} from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import FormLabel from '../../components/common/FormLabel';
import api from '../../src/api';

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

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedParty, setSelectedParty] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState(null);

  // Field mapping: 
  // Backend: Name, PhoneNumber, City, Gstin, CurrentBalance, Notes, Type (0=Customer, 1=Supplier)

  const [customerForm, setCustomerForm] = useState({ name: '', phoneNumber: '', city: '', gstin: '', currentBalance: '', notes: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', phoneNumber: '', city: '', gstin: '', currentBalance: '', notes: '' });

  const [financialSummary, setFinancialSummary] = useState({ totalToReceive: 0, totalToPay: 0, netBalance: 0 });

  useEffect(() => {
    fetchParties();
  }, []);

  // Recalculate summary when parties change
  useEffect(() => {
    calculateFinancialSummary(parties);
  }, [parties]);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/parties');
      // Backend returns all parties. We filter locally.
      setParties(data || []);
    } catch (error) {
      console.error('Error fetching parties:', error);
      // setParties([]); // Keep existing if error? Or clear?
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialSummary = (data) => {
    let toReceive = 0;
    let toPay = 0;

    data.forEach(p => {
      const bal = p.currentBalance || 0;
      if (bal > 0) toReceive += bal;
      else toPay += Math.abs(bal);
    });

    setFinancialSummary({
      totalToReceive: toReceive,
      totalToPay: toPay,
      netBalance: toReceive - toPay
    });
  };

  // Filter logic
  const filteredParties = parties.filter(party => {
    // Type filtering
    // Backend Type: 0 = CUSTOMER, 1 = SUPPLIER
    // We can also check party.type if mapped, but let's assume raw 0/1 or check both
    const isCustomer = party.type === 0 || party.type === 'CUSTOMER';
    const isSupplier = party.type === 1 || party.type === 'SUPPLIER';

    if (activeTab === 'customer' && !isCustomer) return false;
    if (activeTab === 'supplier' && !isSupplier) return false;

    // Search filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = party.name?.toLowerCase().includes(q);
      const matchPhone = party.phoneNumber?.includes(q);
      return matchName || matchPhone;
    }

    return true;
  });

  const { totalToReceive, totalToPay, netBalance } = financialSummary;

  const handleOpenAddModal = () => {
    setEditingPartyId(null);
    if (activeTab === 'all') setIsTypeSelectionOpen(true);
    else if (activeTab === 'customer') {
      setCustomerForm({ name: '', phoneNumber: '', city: '', gstin: '', currentBalance: '', notes: '' });
      setIsCustomerModalOpen(true);
    }
    else {
      setSupplierForm({ name: '', phoneNumber: '', city: '', gstin: '', currentBalance: '', notes: '' });
      setIsSupplierModalOpen(true);
    }
  };

  const handleEditParty = (party, e) => {
    e.stopPropagation();
    setEditingPartyId(party.id);

    // Check type (0 or 1)
    const isCustomer = party.type === 0 || party.type === 'CUSTOMER';

    if (isCustomer) {
      setCustomerForm({
        name: party.name,
        phoneNumber: party.phoneNumber || '',
        city: party.city || '',
        gstin: party.gstin || '',
        currentBalance: party.currentBalance || 0,
        notes: party.notes || ''
      });
      setIsCustomerModalOpen(true);
    } else {
      setSupplierForm({
        name: party.name,
        phoneNumber: party.phoneNumber || '',
        city: party.city || '',
        gstin: party.gstin || '',
        currentBalance: party.currentBalance || 0,
        notes: party.notes || ''
      });
      setIsSupplierModalOpen(true);
    }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    const payload = {
      ...customerForm,
      type: 0, // CUSTOMER
      currentBalance: parseFloat(customerForm.currentBalance || 0)
    };

    try {
      if (editingPartyId) {
        await api.put(`/parties/${editingPartyId}`, { id: editingPartyId, ...payload });
      } else {
        await api.post('/parties', payload);
      }
      setIsCustomerModalOpen(false);
      fetchParties();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    const payload = {
      ...supplierForm,
      type: 1, // SUPPLIER
      currentBalance: parseFloat(supplierForm.currentBalance || 0)
    };

    try {
      if (editingPartyId) {
        await api.put(`/parties/${editingPartyId}`, { id: editingPartyId, ...payload });
      } else {
        await api.post('/parties', payload);
      }
      setIsSupplierModalOpen(false);
      fetchParties();
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    }
  };

  const handleDeleteParty = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/parties/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      fetchParties();
    } catch (error) {
      console.error('Error deleting party:', error);
      alert('Failed to delete party');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-gray-800">Parties</h1><p className="text-sm text-gray-500 font-medium">Manage your network and financial balances.</p></div>
        <button onClick={handleOpenAddModal} className={`flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg ${activeTab === 'customer' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : activeTab === 'supplier' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'}`}>
          <Plus size={18} /> {activeTab === 'all' ? 'Add Party' : activeTab === 'customer' ? 'Add New Customer' : 'Add New Supplier'}
        </button>
      </div>

      {/* DYNAMIC STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-5 rounded-2xl border bg-white shadow-sm flex items-center gap-4 ${activeTab === 'supplier' ? 'border-purple-100' : 'border-blue-100'}`}>
          <div className={`p-3 rounded-xl ${activeTab === 'supplier' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{activeTab === 'supplier' ? <Truck size={24} /> : <Users size={24} />}</div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{activeTab === 'all' ? 'Total Parties' : activeTab === 'customer' ? 'Total Customers' : 'Total Suppliers'}</p><h3 className="text-2xl font-black text-gray-800">{filteredParties.length}</h3></div>
        </div>
        <div className="p-5 rounded-2xl border border-green-100 bg-green-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-green-600 rounded-xl shadow-sm"><ArrowDownLeft size={24} /></div>
          <div><p className="text-xs font-bold text-green-700 uppercase tracking-wider">To Receive</p><h3 className="text-2xl font-black text-green-800">₹{totalToReceive.toLocaleString()}</h3></div>
        </div>
        <div className="p-5 rounded-2xl border border-red-100 bg-red-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-red-600 rounded-xl shadow-sm"><ArrowUpRight size={24} /></div>
          <div><p className="text-xs font-bold text-red-700 uppercase tracking-wider">To Pay</p><h3 className="text-2xl font-black text-red-800">₹{totalToPay.toLocaleString()}</h3></div>
        </div>
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-gray-600 rounded-xl shadow-sm"><Briefcase size={24} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Balance</p><h3 className={`text-2xl font-black ${netBalance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>₹{Math.abs(netBalance).toLocaleString()}</h3></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
          {['all', 'customer', 'supplier'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:flex-none px-8 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200' : 'text-gray-400 hover:text-gray-700'}`}>{tab}</button>
          ))}
        </div>
        <div className="relative w-full md:w-96"><SearchBar placeholder="Search by name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
      </div>

      {/* LIST VIEW */}
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((party) => {
            const isCustomer = party.type === 0 || party.type === 'CUSTOMER';
            const bal = party.currentBalance || 0;
            // Logic: Positive (+) = Receivable (Green), Negative (-) = Payable (Red)
            const balanceType = bal > 0 ? 'receive' : bal < 0 ? 'pay' : 'neutral';

            return (
              <div key={party.id} onClick={() => setSelectedParty(party)} className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer flex flex-col group overflow-hidden">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${isCustomer ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{isCustomer ? <UserCircle2 size={24} /> : <Building2 size={24} />}</div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${isCustomer ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>{isCustomer ? 'CUSTOMER' : 'SUPPLIER'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">{party.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">{party.phoneNumber && <span className="flex items-center gap-1.5"><Phone size={14} /> {party.phoneNumber}</span>}{party.city && <span className="flex items-center gap-1.5"><MapPin size={14} /> {party.city}</span>}</div>
                  <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Balance</p><p className={`text-2xl font-black ${balanceType === 'receive' ? 'text-green-600' : balanceType === 'pay' ? 'text-red-600' : 'text-gray-400'}`}>₹{Math.abs(bal).toLocaleString()}</p></div>
                    {bal !== 0 && (<button onClick={(e) => { e.stopPropagation(); alert(`Opening WhatsApp...`); }} className="w-10 h-10 flex items-center justify-center bg-[#25D366] text-white rounded-xl shadow-md hover:scale-110 transition-transform"><MessageCircle size={20} /></button>)}
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex gap-2 text-[10px] text-gray-400 font-bold uppercase">{party.notes ? party.notes.substring(0, 15) + (party.notes.length > 15 ? '...' : '') : ''}</div>
                  <div className="flex gap-1">
                    <button onClick={(e) => handleEditParty(party, e)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(party.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* --- MODAL: TYPE SELECTION --- */}
      {isTypeSelectionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"><h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Select Party Type</h3><button onClick={() => setIsTypeSelectionOpen(false)}><X size={20} className="text-gray-400" /></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => { setIsTypeSelectionOpen(false); setCustomerForm({ name: '', phoneNumber: '', city: '', gstin: '', currentBalance: '', notes: '' }); setIsCustomerModalOpen(true); }} className="flex flex-col items-center gap-3 p-8 rounded-[24px] bg-blue-50 border-2 border-transparent hover:border-blue-500 transition-all group text-blue-600"><UserCircle2 size={40} /> <span className="font-black text-sm">CUSTOMER</span></button>
              <button onClick={() => { setIsTypeSelectionOpen(false); setSupplierForm({ name: '', phoneNumber: '', city: '', gstin: '', currentBalance: '', notes: '' }); setIsSupplierModalOpen(true); }} className="flex flex-col items-center gap-3 p-8 rounded-[24px] bg-purple-50 border-2 border-transparent hover:border-purple-500 transition-all group text-purple-600"><Building2 size={40} /> <span className="font-black text-sm">SUPPLIER</span></button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CUSTOMER FORM --- */}
      {/* --- MODAL: CUSTOMER FORM (REDESIGNED) --- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <span className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-lg"><UserCircle2 size={20} /></span>
                  {editingPartyId ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <p className="text-sm text-gray-400 font-medium ml-1 mt-1">Enter customer details to track sales & balance.</p>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form id="customerForm" onSubmit={handleSaveCustomer} className="space-y-8">

                {/* Section 1: Basic Identity */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithIcon
                      label="Customer / Business Name"
                      icon={UserCircle2}
                      placeholder="e.g. Rahul General Store"
                      value={customerForm.name}
                      onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                      required
                      className="md:col-span-2"
                    />
                    <InputWithIcon
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      placeholder="e.g. 98765 43210"
                      value={customerForm.phoneNumber}
                      onChange={e => setCustomerForm({ ...customerForm, phoneNumber: e.target.value })}
                    />
                    <InputWithIcon
                      label="City / Location"
                      icon={Map}
                      placeholder="e.g. Andheri, Mumbai"
                      value={customerForm.city}
                      onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })}
                    />
                  </div>
                </div>

                {/* Section 2: Financials & Tax */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2 mb-4">Billing Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithIcon
                      label="GSTIN (Optional)"
                      icon={Hash}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      value={customerForm.gstin}
                      onChange={e => setCustomerForm({ ...customerForm, gstin: e.target.value.toUpperCase() })}
                    />

                    {!editingPartyId && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">Opening Balance</label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600">
                            <Wallet size={18} />
                          </div>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={customerForm.currentBalance}
                            onChange={e => setCustomerForm({ ...customerForm, currentBalance: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-green-50/50 border border-green-200 rounded-xl font-bold text-green-800 placeholder:text-green-300 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                          />
                          <p className="text-[10px] text-green-600 font-bold mt-1.5 ml-1">Positive (+) = You will receive money</p>
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
                    value={customerForm.notes}
                    onChange={e => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  />
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
              <button onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-4 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
              <button type="submit" form="customerForm" className="flex-[2] py-4 text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={20} /> {editingPartyId ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL: SUPPLIER FORM --- */}
      {/* --- MODAL: SUPPLIER FORM (REDESIGNED) --- */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <span className="p-2 bg-purple-600 text-white rounded-lg shadow-purple-200 shadow-lg"><Truck size={20} /></span>
                  {editingPartyId ? 'Edit Supplier' : 'Add New Supplier'}
                </h3>
                <p className="text-sm text-gray-400 font-medium ml-1 mt-1">Manage vendors you purchase goods from.</p>
              </div>
              <button onClick={() => setIsSupplierModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form id="supplierForm" onSubmit={handleSaveSupplier} className="space-y-8">

                {/* Section 1: Business Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-2 mb-4">Vendor Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithIcon
                      label="Supplier / Agency Name"
                      icon={Building2}
                      placeholder="e.g. Coca Cola Agency"
                      value={supplierForm.name}
                      onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      required
                      className="md:col-span-2"
                    />
                    <InputWithIcon
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      placeholder="e.g. 022 2424 5050"
                      value={supplierForm.phoneNumber}
                      onChange={e => setSupplierForm({ ...supplierForm, phoneNumber: e.target.value })}
                    />
                    <InputWithIcon
                      label="City / Depot Location"
                      icon={Map}
                      placeholder="e.g. Pune Ind. Estate"
                      value={supplierForm.city}
                      onChange={e => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    />
                  </div>
                </div>

                {/* Section 2: Financials */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-2 mb-4">Accounts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWithIcon
                      label="GSTIN (Optional)"
                      icon={Hash}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      value={supplierForm.gstin}
                      onChange={e => setSupplierForm({ ...supplierForm, gstin: e.target.value.toUpperCase() })}
                    />

                    {!editingPartyId && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">Opening Payable</label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600">
                            <Banknote size={18} />
                          </div>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={supplierForm.currentBalance}
                            onChange={e => setSupplierForm({ ...supplierForm, currentBalance: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-red-50/50 border border-red-200 rounded-xl font-bold text-red-800 placeholder:text-red-300 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                          />
                          <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">Negative (-) = You owe money</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Notes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Internal Notes</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Order on Mondays only..."
                    value={supplierForm.notes}
                    onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all resize-none"
                  />
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
              <button onClick={() => setIsSupplierModalOpen(false)} className="flex-1 py-4 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
              <button type="submit" form="supplierForm" className="flex-[2] py-4 text-white bg-purple-600 hover:bg-purple-700 font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={20} /> {editingPartyId ? 'Update Supplier' : 'Save Supplier'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 p-8">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner"><Trash2 size={32} /></div>
            <h3 className="text-xl font-black text-gray-800 text-center mb-2">Delete Profile?</h3>
            <p className="text-gray-400 text-sm text-center mb-8 font-medium">This will permanently remove the record and transaction history.</p>
            <div className="flex gap-4"><button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl transition-all">Cancel</button><button onClick={handleDeleteParty} className="flex-1 py-4 text-white bg-red-600 hover:bg-red-700 font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all">Delete</button></div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Parties;