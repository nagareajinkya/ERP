import React, { useState } from 'react';
import { 
  Users, Truck, Search, Plus, MessageCircle, 
  Phone, ArrowUpRight, ArrowDownLeft, X, CheckCircle2, 
  Receipt, Download, ShieldCheck, Building2, UserCircle2, 
  Edit2, Trash2, MapPin, FileText, AlertTriangle, Briefcase
} from 'lucide-react';
import { MOCK_PARTIES, MOCK_LEDGER } from '../../src/data/partiesData';

const Parties = () => {
  const [parties, setParties] = useState(MOCK_PARTIES);
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedParty, setSelectedParty] = useState(null); 
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState(null);

  // FULL FORM STATES RESTORED
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', city: '', gstin: '', creditLimit: '', openingBalance: '', notes: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', contactPerson: '', phone: '', city: '', gsn: '', openingBalance: '', notes: '' });

  // --- STATS LOGIC ---
  const totalToReceive = parties.filter(p => p.type === 'customer').reduce((sum, p) => sum + (p.balanceType === 'receive' ? p.balance : 0), 0);
  const totalToPay = parties.filter(p => p.type === 'supplier').reduce((sum, p) => sum + (p.balanceType === 'pay' ? p.balance : 0), 0);
  const netBalance = totalToReceive - totalToPay;

  const filteredParties = parties.filter(p => 
    (activeTab === 'all' || p.type === activeTab) && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery))
  );

  const handleOpenAddModal = () => {
    setEditingPartyId(null);
    if (activeTab === 'all') setIsTypeSelectionOpen(true);
    else if (activeTab === 'customer') { setCustomerForm({ name: '', phone: '', city: '', gstin: '', creditLimit: '', openingBalance: '', notes: '' }); setIsCustomerModalOpen(true); }
    else { setSupplierForm({ name: '', contactPerson: '', phone: '', city: '', gsn: '', openingBalance: '', notes: '' }); setIsSupplierModalOpen(true); }
  };

  const handleEditParty = (party, e) => {
    e.stopPropagation();
    setEditingPartyId(party.id);
    if (party.type === 'customer') { setCustomerForm({ ...party }); setIsCustomerModalOpen(true); }
    else { setSupplierForm({ ...party }); setIsSupplierModalOpen(true); }
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
          <div className={`p-3 rounded-xl ${activeTab === 'supplier' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{activeTab === 'supplier' ? <Truck size={24}/> : <Users size={24}/>}</div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{activeTab === 'all' ? 'Total Parties' : activeTab === 'customer' ? 'Total Customers' : 'Total Suppliers'}</p><h3 className="text-2xl font-black text-gray-800">{filteredParties.length}</h3></div>
        </div>
        <div className="p-5 rounded-2xl border border-green-100 bg-green-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-green-600 rounded-xl shadow-sm"><ArrowDownLeft size={24}/></div>
          <div><p className="text-xs font-bold text-green-700 uppercase tracking-wider">To Receive</p><h3 className="text-2xl font-black text-green-800">₹{totalToReceive.toLocaleString()}</h3></div>
        </div>
        <div className="p-5 rounded-2xl border border-red-100 bg-red-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-red-600 rounded-xl shadow-sm"><ArrowUpRight size={24}/></div>
          <div><p className="text-xs font-bold text-red-700 uppercase tracking-wider">To Pay</p><h3 className="text-2xl font-black text-red-800">₹{totalToPay.toLocaleString()}</h3></div>
        </div>
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-gray-600 rounded-xl shadow-sm"><Briefcase size={24}/></div>
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
        <div className="relative w-full md:w-96"><Search className="absolute left-4 top-3 text-gray-400" size={20} /><input type="text" placeholder="Search by name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all shadow-inner"/></div>
      </div>

      {/* LIST VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map((party) => (
          <div key={party.id} onClick={() => setSelectedParty(party)} className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer flex flex-col group overflow-hidden">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${party.type === 'customer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{party.type === 'customer' ? <UserCircle2 size={24}/> : <Building2 size={24}/>}</div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${party.type === 'customer' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>{party.type}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">{party.name}</h3>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">{party.phone && <span className="flex items-center gap-1.5"><Phone size={14}/> {party.phone}</span>}{party.city && <span className="flex items-center gap-1.5"><MapPin size={14}/> {party.city}</span>}</div>
              <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Balance Due</p><p className={`text-2xl font-black ${party.balanceType === 'receive' ? 'text-green-600' : party.balanceType === 'pay' ? 'text-red-600' : 'text-gray-400'}`}>₹{party.balance.toLocaleString()}</p></div>
                {party.balance > 0 && (<button onClick={(e) => { e.stopPropagation(); alert(`Opening WhatsApp...`); }} className="w-10 h-10 flex items-center justify-center bg-[#25D366] text-white rounded-xl shadow-md hover:scale-110 transition-transform"><MessageCircle size={20}/></button>)}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex gap-2">{party.tags.map(tag => (<span key={tag} className="text-[9px] font-extrabold px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded uppercase">{tag}</span>))}</div>
              <div className="flex gap-1">
                <button onClick={(e) => handleEditParty(party, e)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm"><Edit2 size={16}/></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(party.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL: TYPE SELECTION (RESTORED) --- */}
      {isTypeSelectionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"><h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Select Party Type</h3><button onClick={() => setIsTypeSelectionOpen(false)}><X size={20} className="text-gray-400"/></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => { setIsTypeSelectionOpen(false); setCustomerForm({ name: '', phone: '', city: '', gstin: '', creditLimit: '', openingBalance: '', notes: '' }); setIsCustomerModalOpen(true); }} className="flex flex-col items-center gap-3 p-8 rounded-[24px] bg-blue-50 border-2 border-transparent hover:border-blue-500 transition-all group text-blue-600"><UserCircle2 size={40}/> <span className="font-black text-sm">CUSTOMER</span></button>
              <button onClick={() => { setIsTypeSelectionOpen(false); setSupplierForm({ name: '', contactPerson: '', phone: '', city: '', gstin: '', openingBalance: '', notes: '' }); setIsSupplierModalOpen(true); }} className="flex flex-col items-center gap-3 p-8 rounded-[24px] bg-purple-50 border-2 border-transparent hover:border-purple-500 transition-all group text-purple-600"><Building2 size={40}/> <span className="font-black text-sm">SUPPLIER</span></button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CUSTOMER FORM (ALL FIELDS RESTORED) --- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-blue-600 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><UserCircle2 size={20}/> {editingPartyId ? 'Edit' : 'New'} Customer</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="p-1 hover:bg-blue-500 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Customer Name *</label><input autoFocus required type="text" placeholder="Full Name" value={customerForm.name} onChange={e=>setCustomerForm({...customerForm, name: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold text-gray-800 transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Phone (Optional)</label><input type="tel" value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm, phone: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">City (Optional)</label><input type="text" value={customerForm.city} onChange={e=>setCustomerForm({...customerForm, city: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">GSTIN (Optional)</label><input type="text" value={customerForm.gstin} onChange={e=>setCustomerForm({...customerForm, gstin: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 uppercase transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Credit Limit (Optional)</label><input type="number" value={customerForm.creditLimit} onChange={e=>setCustomerForm({...customerForm, creditLimit: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
                
                {!editingPartyId && (
                  <div className="col-span-2 bg-green-50 p-4 rounded-2xl border border-green-100">
                    <label className="block text-[10px] font-black text-green-700 uppercase mb-1.5 flex items-center gap-1"><ArrowDownLeft size={12}/> Opening Balance (Old Udhaar)</label>
                    <input type="number" placeholder="0.00" value={customerForm.openingBalance} onChange={e=>setCustomerForm({...customerForm, openingBalance: e.target.value})} className="w-full p-3 bg-white border-2 border-green-200 rounded-xl focus:border-green-500 outline-none font-bold text-gray-800 transition-all"/>
                  </div>
                )}
                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Notes (Optional)</label><input type="text" value={customerForm.notes} onChange={e=>setCustomerForm({...customerForm, notes: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
              </div>
              <div className="flex gap-4"><button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl">Cancel</button><button type="submit" className="flex-1 py-4 text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all">{editingPartyId ? 'Update' : 'Save'} Customer</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: SUPPLIER FORM (ALL FIELDS RESTORED) --- */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-purple-600 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><Building2 size={20}/> {editingPartyId ? 'Edit' : 'New'} Supplier</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="p-1 hover:bg-purple-500 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Business Name *</label><input autoFocus required type="text" value={supplierForm.name} onChange={e=>setSupplierForm({...supplierForm, name: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none font-bold text-gray-800 transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Contact Person (Optional)</label><input type="text" value={supplierForm.contactPerson} onChange={e=>setSupplierForm({...supplierForm, contactPerson: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Phone (Optional)</label><input type="tel" value={supplierForm.phone} onChange={e=>setSupplierForm({...supplierForm, phone: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">City (Optional)</label><input type="text" value={supplierForm.city} onChange={e=>setSupplierForm({...supplierForm, city: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">GSTIN (Optional)</label><input type="text" value={supplierForm.gstin} onChange={e=>setSupplierForm({...supplierForm, gstin: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 uppercase transition-all"/></div>
                
                {!editingPartyId && (
                  <div className="col-span-2 bg-red-50 p-4 rounded-2xl border border-red-100">
                    <label className="block text-[10px] font-black text-red-700 uppercase mb-1.5 flex items-center gap-1"><ArrowUpRight size={12}/> Opening Balance (Money you owe)</label>
                    <input type="number" placeholder="0.00" value={supplierForm.openingBalance} onChange={e=>setSupplierForm({...supplierForm, openingBalance: e.target.value})} className="w-full p-3 bg-white border-2 border-red-200 rounded-xl focus:border-red-500 outline-none font-bold text-gray-800 transition-all"/>
                  </div>
                )}
                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Notes (Optional)</label><input type="text" value={supplierForm.notes} onChange={e=>setSupplierForm({...supplierForm, notes: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none font-bold text-gray-800 transition-all"/></div>
              </div>
              <div className="flex gap-4"><button type="button" onClick={() => setIsSupplierModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl">Cancel</button><button type="submit" className="flex-1 py-4 text-white bg-purple-600 hover:bg-purple-700 font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all">{editingPartyId ? 'Update' : 'Save'} Supplier</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 p-8">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner"><Trash2 size={32}/></div>
            <h3 className="text-xl font-black text-gray-800 text-center mb-2">Delete Profile?</h3>
            <p className="text-gray-400 text-sm text-center mb-8 font-medium">This will permanently remove the record and transaction history.</p>
            <div className="flex gap-4"><button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl transition-all">Cancel</button><button onClick={() => { setParties(parties.filter(p => p.id !== deleteConfirmId)); setDeleteConfirmId(null); }} className="flex-1 py-4 text-white bg-red-600 hover:bg-red-700 font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all">Delete</button></div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Parties;