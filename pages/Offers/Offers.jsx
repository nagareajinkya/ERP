import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Tag, Gift, Users, Calendar, Edit2, Trash2, 
  Check, X, Search, Filter, Play, Pause, AlertCircle, 
  Square, Clock, ArrowDownUp, AlertTriangle, ChevronRight,
  Repeat, Receipt, Copy, ChevronDown, Package
} from 'lucide-react';

// ==========================================
// 1. MOCK DATABASE (Products & Customers)
// ==========================================

const MOCK_PRODUCTS = [
  { id: 1, name: 'Amul Butter', unit: 'pc' },
  { id: 2, name: 'Basmati Rice', unit: 'kg' },
  { id: 3, name: 'Britannia Biscuits', unit: 'pkt' },
  { id: 4, name: 'Coca Cola', unit: 'ltr' },
  { id: 5, name: 'Dove Soap', unit: 'pc' },
  { id: 6, name: 'Fortune Oil', unit: 'ltr' },
  { id: 7, name: 'Maggi Noodles', unit: 'pkt' },
  { id: 8, name: 'Sugar', unit: 'kg' },
  { id: 9, name: 'Tata Salt', unit: 'kg' },
  { id: 10, name: 'Wheat Flour', unit: 'kg' },
  { id: 11, name: 'Red Label Tea', unit: 'box' },
  { id: 12, name: 'Colgate Paste', unit: 'pc' },
  { id: 13, name: 'Aashirvaad Atta', unit: 'kg' },
  { id: 14, name: 'Dettol Handwash', unit: 'ml' },
].sort((a, b) => a.name.localeCompare(b.name));

const MOCK_CUSTOMERS = [
  { id: 101, name: 'Ramesh Gupta', type: 'Frequent', spend: '₹45,000', spendValue: 45000, visits: 12 },
  { id: 102, name: 'Suresh Patil', type: 'Top Spender', spend: '₹82,000', spendValue: 82000, visits: 4 },
  { id: 103, name: 'Anita Desai', type: 'Regular', spend: '₹12,000', spendValue: 12000, visits: 8 },
  { id: 104, name: 'Vikram Singh', type: 'Top Spender', spend: '₹65,000', spendValue: 65000, visits: 3 },
  { id: 105, name: 'Priya Sharma', type: 'New', spend: '₹2,000', spendValue: 2000, visits: 1 },
  { id: 106, name: 'Amit Verma', type: 'Regular', spend: '₹8,500', spendValue: 8500, visits: 6 },
  { id: 107, name: 'Kavita Das', type: 'Top Spender', spend: '₹71,000', spendValue: 71000, visits: 9 },
  { id: 108, name: 'Rahul Roy', type: 'Frequent', spend: '₹34,000', spendValue: 34000, visits: 15 },
];

// ==========================================
// 2. REUSABLE COMPONENT: Product Search
// ==========================================

const ProductSearch = ({ label, placeholder, value, onSelect, unit, onUnitChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => { setSearchTerm(value); }, [value]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen]);

  const filtered = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 relative" ref={wrapperRef}>
       <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
       <div className="flex gap-2">
          <div className="relative flex-[2]">
             <input 
               ref={inputRef}
               type="text" 
               disabled={disabled}
               placeholder={placeholder}
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
               onFocus={() => !disabled && setIsOpen(true)}
               className={`w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm transition-all ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-blue-200 text-gray-800'}`}
             />
             {!disabled && isOpen && filtered.length > 0 && (
               <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150">
                 {filtered.map(product => (
                   <div 
                     key={product.id} 
                     onClick={() => { onSelect(product); setIsOpen(false); }}
                     className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex justify-between group"
                   >
                     <span className="font-medium">{product.name}</span>
                     <span className="text-gray-400 text-xs group-hover:text-blue-500 bg-gray-50 px-2 py-0.5 rounded">{product.unit}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
          <div className="relative flex-1">
             <select 
               value={unit} 
               disabled={disabled}
               onChange={(e) => onUnitChange(e.target.value)}
               className={`w-full h-full px-3 border rounded-xl outline-none text-sm font-medium appearance-none transition-colors ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-blue-200 text-gray-700 hover:bg-white cursor-pointer'}`}
             >
                {['kg', 'g', 'ltr', 'ml', 'pc', 'pkt', 'box', 'dz'].map(u => <option key={u} value={u}>{u}</option>)}
             </select>
             {!disabled && <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>}
          </div>
       </div>
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT: OFFERS
// ==========================================

const Offers = () => {
  // --- UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [offerSearch, setOfferSearch] = useState('');
  
  // --- MODAL STATE ---
  const [viewOffer, setViewOffer] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, offerId: null, offerName: '' });
  
  // --- FORM & EDITING STATE ---
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [errors, setErrors] = useState({});
  
  // --- REFS ---
  const customerListRef = useRef(null);
  const nameInputRef = useRef(null);
  const dateInputRef = useRef(null);

  // --- INITIAL FORM DATA ---
  const initialForm = {
    name: '',
    // Product Rules
    isProductSpecific: false, isSameProduct: true,
    buyProductName: '', buyProductUnit: 'kg', buyQty: '',
    rewardType: 'free_item', getProductName: '', getProductUnit: 'kg', getQty: '',
    discountType: 'percentage', discountValue: '',
    // Cart Rules
    cartDiscountType: 'percentage', cartDiscountValue: '', minPurchase: '',
    // Usage & Limits
    usageType: 'unlimited', usageLimitCount: '1',
    // Target Audience
    targetType: 'all', 
    minVisits: '5', frequentDuration: '30',
    topSpenderCount: '5', topSpenderDuration: '1', topSpenderUnit: 'Years',
    // Dates
    startDate: new Date().toISOString().split('T')[0], endDate: '',
    selectedCustomers: [] 
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [customerSearch, setCustomerSearch] = useState('');
  const [activeCustomerFilter, setActiveCustomerFilter] = useState('All');

  // --- MOCK OFFERS ---
  const [offers, setOffers] = useState([
    {
      id: 1, name: 'Diwali Dhamaka', type: 'Cart Discount', value: '10%', 
      status: 'active', usage: 42, start: '2025-10-20', end: '2025-11-05',
      target: 'All Customers', usageType: 'unlimited'
    },
    {
      id: 2, name: 'Buy 1kg Sugar Get 1 Salt Free', type: 'Free Item', 
      status: 'active', usage: 15, start: '2025-10-01', end: '2025-10-31',
      target: 'All Customers', usageType: 'single'
    },
    {
      id: 3, name: 'Monsoon Sale', type: 'Product Discount', value: '₹50 Off',
      status: 'expired', usage: 120, start: '2025-06-01', end: '2025-06-30',
      target: 'Top 50 Spenders', usageType: 'unlimited'
    },
    {
      id: 4, name: 'New Year Bash', type: 'Cart Discount', value: '15%',
      status: 'scheduled', usage: 0, start: '2026-01-01', end: '2026-01-05',
      target: 'Frequent Visitors', usageType: 'limited'
    },
    {
      id: 5, name: 'Weekend Flash Sale', type: 'Free Item', value: '1 Free',
      status: 'paused', usage: 5, start: '2025-11-15', end: '2025-11-16',
      target: 'Specific', usageType: 'single'
    }
  ]);

  const redemptions = [
    { id: 1, customer: 'Ramesh Gupta', date: 'Oct 22, 2025', count: 3, save: '₹120' },
    { id: 2, customer: 'Suresh Patil', date: 'Oct 23, 2025', count: 1, save: '₹450' },
    { id: 3, customer: 'Anita Desai', date: 'Oct 24, 2025', count: 5, save: '₹80' },
    { id: 4, customer: 'Vikram Singh', date: 'Oct 25, 2025', count: 2, save: '₹200' },
  ];

  // --- LOGIC: Filter Customers ---
  const getEligibleCustomers = () => {
    let filtered = [...MOCK_CUSTOMERS];
    if (customerSearch) filtered = filtered.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
    
    if (formData.targetType === 'top_spenders') {
      filtered.sort((a, b) => b.spendValue - a.spendValue);
      filtered = filtered.slice(0, parseInt(formData.topSpenderCount) || 5);
    } else if (formData.targetType === 'frequent') {
      filtered = filtered.filter(c => c.visits > (parseInt(formData.minVisits) || 0));
    } else if (formData.targetType === 'specific') {
      if (activeCustomerFilter !== 'All') filtered = filtered.filter(c => c.type === activeCustomerFilter);
      filtered.sort((a, b) => (b.spendValue + b.visits*1000) - (a.spendValue + a.visits*1000));
    }
    return filtered;
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (['specific', 'top_spenders', 'frequent'].includes(formData.targetType) && customerListRef.current) {
      setTimeout(() => customerListRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
    if (['top_spenders', 'frequent'].includes(formData.targetType)) {
      setFormData(prev => ({ ...prev, selectedCustomers: getEligibleCustomers().map(c => c.id) }));
    }
  }, [formData.targetType, formData.topSpenderCount, formData.minVisits, activeCustomerFilter]);

  // --- HANDLERS ---
  const handleCreateNew = () => { setEditingOfferId(null); setFormData(initialForm); setErrors({}); setIsModalOpen(true); };
  
  const handleDuplicate = (offer, e) => {
    e.stopPropagation(); setEditingOfferId(null); setErrors({});
    setFormData({ ...initialForm, name: `${offer.name} (Copy)`, targetType: offer.target.includes('Top') ? 'top_spenders' : 'all' });
    setIsModalOpen(true);
  };

  const handleEdit = (offer, e) => {
    e.stopPropagation(); setEditingOfferId(offer.id); setErrors({});
    setFormData({ ...initialForm, name: offer.name, startDate: offer.start, endDate: offer.end }); 
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Offer Name is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    
    setErrors(newErrors);

    if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInputRef.current.focus();
        return;
    }
    if (newErrors.startDate && dateInputRef.current) {
        dateInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const newOffer = {
      id: editingOfferId || Date.now(),
      name: formData.name,
      type: formData.isProductSpecific ? (formData.rewardType === 'free_item' ? 'Free Item' : 'Product Discount') : 'Cart Discount',
      value: formData.isProductSpecific ? (formData.rewardType === 'discount' ? formData.discountValue : '1 Free') : formData.cartDiscountValue,
      start: formData.startDate, end: formData.endDate,
      status: 'active', usage: 0,
      usageType: formData.usageType, usageLimitCount: formData.usageLimitCount,
      target: formData.targetType === 'all' ? 'All Customers' : formData.targetType === 'top_spenders' ? `Top ${formData.topSpenderCount}` : 'Specific'
    };
    
    if(editingOfferId) {
       setOffers(offers.map(o => o.id === editingOfferId ? newOffer : o));
    } else {
       setOffers([newOffer, ...offers]);
    }
    setIsModalOpen(false);
  };

  const handlePauseToggle = (id, currentStatus, e) => {
    e.stopPropagation();
    setOffers(offers.map(o => o.id === id ? { ...o, status: currentStatus === 'active' ? 'paused' : 'active' } : o));
  };
  
  const initiateStop = (offer, e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, type: 'stop', offerId: offer.id, offerName: offer.name }); };
  const initiateDelete = (offer, e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, type: 'delete', offerId: offer.id, offerName: offer.name }); };
  const confirmAction = () => {
    confirmModal.type === 'stop' ? setOffers(offers.map(o => o.id === confirmModal.offerId ? { ...o, status: 'expired' } : o)) : setOffers(offers.filter(o => o.id !== confirmModal.offerId));
    setConfirmModal({ isOpen: false, type: null, offerId: null, offerName: '' });
  };
  const toggleCustomerSelection = (id) => {
    const current = formData.selectedCustomers;
    setFormData({ ...formData, selectedCustomers: current.includes(id) ? current.filter(cid => cid !== id) : [...current, id] });
  };

  const handleBuyProductSelect = (product) => {
    setFormData({ 
      ...formData, 
      buyProductName: product.name, 
      buyProductUnit: product.unit,
      getProductName: formData.isSameProduct ? product.name : formData.getProductName,
      getProductUnit: formData.isSameProduct ? product.unit : formData.getProductUnit,
    });
  };

  const handleSameProductToggle = () => {
    const newState = !formData.isSameProduct;
    setFormData({
      ...formData,
      isSameProduct: newState,
      getProductName: newState ? formData.buyProductName : '',
      getProductUnit: newState ? formData.buyProductUnit : 'kg'
    });
  };

  const handleQtyFocus = (field) => { if (!formData[field]) setFormData({ ...formData, [field]: '1' }); };

  const getFilteredOffers = () => {
    let filtered = offers.filter(o => (activeTab === 'all' || o.status === activeTab) && o.name.toLowerCase().includes(offerSearch.toLowerCase()));
    return filtered.sort((a, b) => new Date(b.start) - new Date(a.start));
  };
  const getStatusColor = (status) => ({ active: 'bg-green-100 text-green-700 border-green-200', scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-200', expired: 'bg-red-100 text-red-700 border-red-200', paused: 'bg-orange-100 text-orange-700 border-orange-200' }[status] || 'bg-gray-100');

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-semibold text-gray-800">Smart Offers</h1><p className="text-sm text-gray-500 mt-1">Manage promotions and auto-apply discounts</p></div>
        <button onClick={handleCreateNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-green-200 transition-all"><Plus size={18} /> Create Offer</button>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex items-center gap-4"><div className="p-3 bg-green-50 text-green-600 rounded-xl"><Tag size={24}/></div><div><p className="text-xs font-medium text-gray-400 uppercase">Active Offers</p><h3 className="text-2xl font-bold text-gray-800">2</h3></div></div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div><div><p className="text-xs font-medium text-gray-400 uppercase">Redeemed</p><h3 className="text-2xl font-bold text-gray-800">143</h3></div></div>
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4"><div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Gift size={24}/></div><div><p className="text-xs font-medium text-gray-400 uppercase">Discount Given</p><h3 className="text-2xl font-bold text-gray-800">₹50,900</h3></div></div>
      </div>

      {/* OFFERS LIST */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
           <div className="flex bg-gray-200/50 p-1 rounded-xl overflow-x-auto">{['all', 'active', 'paused', 'scheduled', 'expired'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>))}</div>
           <div className="relative w-full md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Search..." value={offerSearch} onChange={(e) => setOfferSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" /></div>
        </div>
        <div className="p-6 space-y-4">
           {getFilteredOffers().length > 0 ? getFilteredOffers().map(offer => (
             <div key={offer.id} onClick={() => setViewOffer(offer)} className="border border-gray-100 rounded-xl p-5 hover:border-green-200 hover:shadow-md transition-all group bg-white cursor-pointer relative">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <div className="flex items-center gap-3"><h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">{offer.name}</h3><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusColor(offer.status)}`}>{offer.status}</span></div>
                      <p className="text-sm text-gray-500">{offer.type} • {offer.target}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2"><span className="flex items-center gap-1"><Calendar size={12}/> {offer.start} - {offer.end || 'Ongoing'}</span><span className="flex items-center gap-1"><Users size={12}/> Used {offer.usage} times</span></div>
                   </div>
                   <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      {['active', 'paused'].includes(offer.status) && (<button onClick={(e) => handlePauseToggle(offer.id, offer.status, e)} className={`p-2 rounded-lg ${offer.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>{offer.status === 'active' ? <Pause size={18}/> : <Play size={18}/>}</button>)}
                      <button onClick={(e) => handleDuplicate(offer, e)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><Copy size={18}/></button>
                      <button onClick={(e) => handleEdit(offer, e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                      {['active', 'paused', 'scheduled'].includes(offer.status) && <button onClick={(e) => initiateStop(offer, e)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Square size={18}/></button>}
                      <button onClick={(e) => initiateDelete(offer, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                   </div>
                </div>
             </div>
           )) : (
             <div className="text-center py-10 text-gray-400"><Tag size={40} className="mx-auto mb-3 opacity-20"/><p>No offers found.</p></div>
           )}
        </div>
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0"><h2 className="text-xl font-bold text-gray-800">{editingOfferId ? 'Edit Offer' : 'Create New Offer'}</h2><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
              <div className="p-6 space-y-8 overflow-y-auto scrollbar-hover flex-1">
                 
                 {/* Basic Info */}
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Name <span className="text-red-500">*</span></label>
                        <input ref={nameInputRef} type="text" value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); if(errors.name) setErrors({...errors, name: null}); }} placeholder="e.g. Diwali Dhamaka Sale" className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 ${errors.name ? 'border-red-500 ring-red-100' : 'bg-gray-50 border-none focus:ring-green-100'}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle size={10}/> {errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label><input ref={dateInputRef} type="date" value={formData.startDate} onChange={(e) => { setFormData({...formData, startDate: e.target.value}); if(errors.startDate) setErrors({...errors, startDate: null}); }} className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 ${errors.startDate ? 'border-red-500 ring-red-100' : 'bg-gray-50 border-none focus:ring-green-100'}`} />{errors.startDate && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.startDate}</p>}</div>
                       <div><label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none" /></div>
                    </div>
                 </div>

                 {/* Usage Limits */}
                 <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 space-y-3">
                    <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-2"><Repeat size={16}/> Usage Limit per Customer</h3>
                    <div className="flex gap-4">{['single', 'unlimited', 'limited'].map(type => (<label key={type} className="flex items-center gap-2 cursor-pointer capitalize"><input type="radio" checked={formData.usageType === type} onChange={() => setFormData({...formData, usageType: type})} className="text-green-600 focus:ring-green-500" /><span className="text-sm font-medium text-gray-700">{type === 'single' ? '1 Time' : type === 'limited' ? 'Custom' : 'Unlimited'}</span></label>))}</div>
                    {formData.usageType === 'limited' && (<div className="flex items-center gap-2 animate-in slide-in-from-top-2"><input type="number" min="1" value={formData.usageLimitCount} onChange={(e) => setFormData({...formData, usageLimitCount: e.target.value})} className="w-20 px-3 py-1.5 bg-white border border-yellow-200 rounded-lg outline-none" /><span className="text-sm text-gray-500">times per customer</span></div>)}
                 </div>

                 {/* Target Audience */}
                 <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Who is this offer for?</label>
                    <select value={formData.targetType} onChange={(e) => setFormData({...formData, targetType: e.target.value, selectedCustomers: []})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-green-100"><option value="all">All Customers</option><option value="top_spenders">Top Spenders</option><option value="frequent">Frequent Visitors</option><option value="specific">Specific Customers</option></select>

                    {formData.targetType === 'top_spenders' && (
                       <div className="flex flex-wrap items-center gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100"><span className="text-sm font-medium text-purple-800">Top</span><input type="number" min="1" value={formData.topSpenderCount} onChange={(e) => setFormData({...formData, topSpenderCount: e.target.value})} className="w-20 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-center" /><span className="text-sm font-medium text-purple-800">Customers in last</span><input type="number" min="1" value={formData.topSpenderDuration} onChange={(e) => setFormData({...formData, topSpenderDuration: e.target.value})} className="w-20 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-center" /><select value={formData.topSpenderUnit} onChange={(e) => setFormData({...formData, topSpenderUnit: e.target.value})} className="px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-sm"><option>Years</option><option>Months</option><option>Weeks</option><option>Days</option></select></div>
                    )}

                    {formData.targetType === 'frequent' && (
                       <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100"><span className="text-sm font-medium text-blue-800">More than</span><input type="number" min="1" value={formData.minVisits} onChange={(e) => setFormData({...formData, minVisits: e.target.value})} className="w-20 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-center"/><span className="text-sm font-medium text-blue-800">visits in last</span><input type="number" min="1" value={formData.frequentDuration} onChange={(e) => setFormData({...formData, frequentDuration: e.target.value})} className="w-20 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-center"/><span className="text-sm font-medium text-blue-800">days.</span></div>
                    )}

                    {['specific', 'top_spenders', 'frequent'].includes(formData.targetType) && (
                       <div ref={customerListRef} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex flex-col gap-3 mb-3">
                             <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Search customer..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
                             {formData.targetType === 'specific' && (<div className="flex gap-2">{['All', 'Frequent', 'Top Spender', 'Regular'].map(filter => (<button key={filter} onClick={() => setActiveCustomerFilter(filter)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${activeCustomerFilter === filter ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200'}`}>{filter}</button>))}</div>)}
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-hover">
                             {getEligibleCustomers().map(cust => (
                               <div key={cust.id} onClick={() => toggleCustomerSelection(cust.id)} className={`flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer ${formData.selectedCustomers.includes(cust.id) ? 'border-green-500 bg-green-50/30' : 'border-gray-100'}`}>
                                  <div className="flex items-center gap-3">
                                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.selectedCustomers.includes(cust.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>{formData.selectedCustomers.includes(cust.id) && <Check size={12} className="text-white"/>}</div>
                                     <div>
                                        <p className="text-sm font-medium text-gray-800">{cust.name}</p>
                                        <p className="text-[10px] text-gray-500">
                                            <span className={formData.targetType === 'top_spenders' || formData.targetType === 'specific' ? 'font-bold text-green-600' : ''}>Spent: {cust.spend}</span> • 
                                            <span className={formData.targetType === 'frequent' || formData.targetType === 'specific' ? 'font-bold text-blue-600 ml-1' : 'ml-1'}>{cust.visits} Visits</span>
                                        </p>
                                     </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>

                 {/* --- OFFER RULES --- */}
                 <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-5">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2"><Gift size={16}/> Offer Rules</h3>
                    
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-medium text-gray-700">Is this offer for specific products?</label>
                       <button onClick={() => setFormData({...formData, isProductSpecific: !formData.isProductSpecific})} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${formData.isProductSpecific ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.isProductSpecific ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                    </div>

                    {formData.isProductSpecific ? (
                      <div className="space-y-6 animate-in slide-in-from-top-2">
                         <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100 w-fit"><input type="checkbox" checked={formData.isSameProduct} onChange={handleSameProductToggle} className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-700 font-medium">Same Product Offer (e.g. Buy X, Get X Free)</span></div>
                         <div className="flex gap-4 items-end">
                            <ProductSearch label="Customer Buys" placeholder="e.g. Sugar" value={formData.buyProductName} unit={formData.buyProductUnit} onSelect={handleBuyProductSelect} onUnitChange={(u) => setFormData({...formData, buyProductUnit: u})}/>
                            <div className="w-24"><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Qty</label><input type="number" min="1" placeholder="e.g. 2" value={formData.buyQty} onFocus={() => handleQtyFocus('buyQty')} onChange={(e) => setFormData({...formData, buyQty: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl outline-none" /></div>
                         </div>
                         <div className="p-4 bg-white rounded-xl border border-dashed border-blue-300">
                            <div className="flex gap-4 mb-4">
                               <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="reward" checked={formData.rewardType === 'free_item'} onChange={() => setFormData({...formData, rewardType: 'free_item'})} className="text-blue-600"/><span className="text-sm font-medium">Free Item</span></label>
                               <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="reward" checked={formData.rewardType === 'discount'} onChange={() => setFormData({...formData, rewardType: 'discount'})} className="text-blue-600"/><span className="text-sm font-medium">Discount</span></label>
                            </div>
                            {formData.rewardType === 'free_item' ? (
                               <div className="flex gap-4 items-end animate-in fade-in">
                                  {formData.isSameProduct ? (
                                    <div className="flex-1 opacity-70"><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Customer Gets (Same Item)</label><input type="text" value={formData.buyProductName || 'Select Buy Product first'} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500" /></div>
                                  ) : (
                                    <ProductSearch label="Customer Gets (Free Item)" placeholder="e.g. Salt" value={formData.getProductName} unit={formData.getProductUnit} onSelect={(p) => setFormData({...formData, getProductName: p.name, getProductUnit: p.unit})} onUnitChange={(u) => setFormData({...formData, getProductUnit: u})}/>
                                  )}
                                  <div className="w-24"><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Qty</label><input type="number" min="1" placeholder="e.g. 1" value={formData.getQty} onFocus={() => handleQtyFocus('getQty')} onChange={(e) => setFormData({...formData, getQty: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl outline-none" /></div>
                               </div>
                            ) : (
                               <div className="flex gap-4 animate-in fade-in">
                                  <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Discount Type</label><select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl outline-none"><option value="percentage">Percentage (%)</option><option value="flat">Flat Amount (₹)</option></select></div>
                                  <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Value</label><input type="number" placeholder={formData.discountType === 'percentage' ? "e.g. 10" : "e.g. 50"} value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl outline-none" /></div>
                               </div>
                            )}
                         </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                         <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label><select value={formData.cartDiscountType} onChange={(e) => setFormData({...formData, cartDiscountType: e.target.value})} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl outline-none"><option value="percentage">Percentage (%)</option><option value="flat">Flat Amount (₹)</option></select></div>
                         <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Value</label><input type="number" placeholder={formData.cartDiscountType === 'percentage' ? "e.g. 5" : "e.g. 100"} value={formData.cartDiscountValue} onChange={(e) => setFormData({...formData, cartDiscountValue: e.target.value})} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl outline-none" /></div>
                         <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Min Purchase Amount (Optional)</label><input type="number" placeholder="e.g. 500" value={formData.minPurchase} onChange={(e) => setFormData({...formData, minPurchase: e.target.value})} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl outline-none" /></div>
                      </div>
                    )}
                 </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100">Cancel</button>
                 <button onClick={handleSubmit} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-lg shadow-green-200">{editingOfferId ? 'Update Offer' : 'Create Offer'}</button>
              </div>
           </div>
        </div>
      )}
      
      {/* CONFIRM MODAL (RESTORED) */}
      {confirmModal.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 p-6">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmModal.type === 'delete' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{confirmModal.type === 'delete' ? <Trash2 size={24}/> : <Square size={24}/>}</div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">{confirmModal.type === 'delete' ? 'Delete Offer?' : 'Stop Offer?'}</h3>
               <p className="text-gray-500 text-sm mb-6">{confirmModal.type === 'delete' ? `Permanently delete "${confirmModal.offerName}"?` : `Stop "${confirmModal.offerName}"? It will be marked as expired.`}</p>
               <div className="flex gap-3">
                  <button onClick={() => setConfirmModal({isOpen: false, type: null, offerId: null})} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">Cancel</button>
                  <button onClick={confirmAction} className={`flex-1 py-3 text-white font-medium rounded-xl shadow-lg ${confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'}`}>{confirmModal.type === 'delete' ? 'Yes, Delete' : 'Yes, Stop'}</button>
               </div>
            </div>
         </div>
      )}

      {/* VIEW DETAILS MODAL (RESTORED) */}
      {viewOffer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <div><h2 className="text-xl font-bold text-gray-800">{viewOffer.name}</h2><p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${viewOffer.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>{viewOffer.status.toUpperCase()} • {viewOffer.start} to {viewOffer.end || 'Ongoing'}</p></div>
                 <button onClick={() => setViewOffer(null)} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 shadow-sm border border-gray-200"><X size={20}/></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-xs text-blue-600 font-bold uppercase mb-1">Offer Value</p><p className="text-lg font-bold text-gray-800">{viewOffer.value}</p><p className="text-xs text-gray-500 mt-1">Type: {viewOffer.type}</p></div>
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100"><p className="text-xs text-purple-600 font-bold uppercase mb-1">Target Audience</p><p className="text-lg font-bold text-gray-800 truncate">{viewOffer.target}</p><p className="text-xs text-gray-500 mt-1">Limit: {viewOffer.usageType}</p></div>
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Receipt size={16} /> Recent Redemptions ({viewOffer.usage})</h3>
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500"><tr><th className="p-3 font-medium">Customer</th><th className="p-3 font-medium">Last Used</th><th className="p-3 font-medium">Times Used</th><th className="p-3 font-medium text-right">Total Saved</th></tr></thead>
                          <tbody className="divide-y divide-gray-100">{viewOffer.usage > 0 ? redemptions.map((r) => (<tr key={r.id} className="hover:bg-gray-50/50"><td className="p-3 font-medium text-gray-800">{r.customer}</td><td className="p-3 text-gray-500">{r.date}</td><td className="p-3 text-gray-500">{r.count} times</td><td className="p-3 text-right font-bold text-green-600">{r.save}</td></tr>)) : (<tr><td colSpan="4" className="p-8 text-center text-gray-400">No redemptions yet.</td></tr>)}</tbody>
                       </table>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Offers;