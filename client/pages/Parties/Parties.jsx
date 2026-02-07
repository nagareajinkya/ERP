import React, { useState, useEffect } from 'react';
import {
  Users, Truck, Plus, ArrowUpRight, ArrowDownLeft, X,
  Building2, UserCircle2, Briefcase, Loader2, Edit2, Trash2, Phone, MapPin, MessageCircle
} from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import { useParties } from '../../hooks/useParties';
import { toast } from 'react-toastify';
import PartyDetailView from './PartyDetailView';
import PartyFormModal from './PartyFormModal';

const Parties = () => {
  const {
    parties,
    loading,
    financialSummary,
    fetchParties,
    addParty,
    updateParty,
    deleteParty
  } = useParties();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedParty, setSelectedParty] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);

  // Unified Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'customer', // 'customer' or 'supplier'
    isEditing: false,
    initialData: null,
    editingId: null
  });

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  // Update selected party object when parties list changes (to keep detail view in sync)
  useEffect(() => {
    if (selectedParty) {
      const updated = parties.find(p => p.id === selectedParty.id);
      if (updated) setSelectedParty(updated);
      // Logic for delete redirect handled in deletion function
    }
  }, [parties, selectedParty]);

  // Filter logic
  const filteredParties = parties.filter(party => {
    const isCustomer = party.type === 0 || party.type === 'CUSTOMER';
    const isSupplier = party.type === 1 || party.type === 'SUPPLIER';

    if (activeTab === 'customer' && !isCustomer) return false;
    if (activeTab === 'supplier' && !isSupplier) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = party.name?.toLowerCase().includes(q);
      const matchPhone = party.phoneNumber?.includes(q);
      return matchName || matchPhone;
    }

    return true;
  });

  const { totalToReceive, totalToPay, netBalance } = financialSummary;

  // --- MODAL HANDLERS ---

  const openAddModal = (type) => {
    setModalState({
      isOpen: true,
      type: type,
      isEditing: false,
      initialData: null,
      editingId: null
    });
    setIsTypeSelectionOpen(false);
  };

  const handleOpenAddModal = () => {
    if (activeTab === 'all') setIsTypeSelectionOpen(true);
    else if (activeTab === 'customer') openAddModal('customer');
    else openAddModal('supplier');
  };

  const handleEditParty = (party, e) => {
    if (e) e.stopPropagation();
    const type = (party.type === 0 || party.type === 'CUSTOMER') ? 'customer' : 'supplier';
    setModalState({
      isOpen: true,
      type: type,
      isEditing: true,
      initialData: party,
      editingId: party.id
    });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleSaveParty = async (formData) => {
    const isCustomer = modalState.type === 'customer';
    const payload = {
      ...formData,
      type: isCustomer ? 0 : 1,
      currentBalance: parseFloat(formData.currentBalance || 0)
    };

    try {
      if (modalState.isEditing) {
        await updateParty(modalState.editingId, { id: modalState.editingId, ...payload });
      } else {
        await addParty(payload);
      }
      closeModal();
    } catch (error) {
      // toast handled in hook
    }
  };

  const handleDeleteParty = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteParty(deleteConfirmId);

      // If the deleted party was the one currently selected in detail view, clear it
      if (selectedParty && selectedParty.id === deleteConfirmId) {
        setSelectedParty(null);
      }

      setDeleteConfirmId(null);
    } catch (error) {
      // toast handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      {selectedParty ? (
        <PartyDetailView
          party={selectedParty}
          onBack={() => setSelectedParty(null)}
          onEdit={handleEditParty}
          onDelete={(id) => setDeleteConfirmId(id)}
        />
      ) : (
        <>
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
                        {bal !== 0 && (<button onClick={(e) => { e.stopPropagation(); toast.info(`Opening WhatsApp...`); }} className="w-10 h-10 flex items-center justify-center bg-[#25D366] text-white rounded-xl shadow-md hover:scale-110 transition-transform"><MessageCircle size={20} /></button>)}
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
        </>
      )}

      {/* --- REUSABLE PARTY FORM MODAL --- */}
      <PartyFormModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSubmit={handleSaveParty}
        type={modalState.type}
        initialData={modalState.initialData}
        isEditing={modalState.isEditing}
      />

      {/* --- MODAL: TYPE SELECTION --- */}
      {isTypeSelectionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"><h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Select Party Type</h3><button onClick={() => setIsTypeSelectionOpen(false)}><X size={20} className="text-gray-400" /></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => openAddModal('customer')} className="flex flex-col items-center gap-3 p-8 rounded-[24px] bg-blue-50 border-2 border-transparent hover:border-blue-500 transition-all group text-blue-600"><UserCircle2 size={40} /> <span className="font-black text-sm">CUSTOMER</span></button>
              <button onClick={() => openAddModal('supplier')} className="flex flex-col items-center gap-3 p-8 rounded-[24px] bg-purple-50 border-2 border-transparent hover:border-purple-500 transition-all group text-purple-600"><Building2 size={40} /> <span className="font-black text-sm">SUPPLIER</span></button>
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