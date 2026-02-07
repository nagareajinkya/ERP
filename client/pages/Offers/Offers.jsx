import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Tag, Gift, Users, Calendar, Edit2, Trash2,
  Check, X, Search, Filter, Play, Pause, AlertCircle,
  Square, Clock, ArrowDownUp, AlertTriangle, ChevronRight,
  Repeat, Receipt, Copy, ChevronDown, Package, Percent, ShoppingBag, Zap, CheckCircle2,
  StopCircle, PlayCircle, IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useOffers } from '../../hooks/useOffers';
import SearchBar from '../../components/common/SearchBar';
import TabsBar from '../../components/common/TabsBar';
import StatCard from '../../components/common/StatCard';
import FormLabel from '../../components/common/FormLabel';

const THEME_COLORS = [
  { id: 'blue', classes: 'bg-blue-100 text-blue-600', border: 'border-blue-100' },
  { id: 'purple', classes: 'bg-purple-100 text-purple-600', border: 'border-purple-100' },
  { id: 'green', classes: 'bg-green-100 text-green-600', border: 'border-green-100' },
  { id: 'orange', classes: 'bg-orange-100 text-orange-600', border: 'border-orange-100' },
  { id: 'pink', classes: 'bg-pink-100 text-pink-600', border: 'border-pink-100' },
  { id: 'indigo', classes: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-100' },
];

const formatDate = (dateString) => {
  if (!dateString) return 'Ongoing';
  const date = new Date(dateString);
  if (isNaN(date)) return 'Invalid Date';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const ProductSearch = ({ label, placeholder, value, onSelect, unit, onUnitChange, disabled = false, availableProducts = [], availableUnits = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => { setSearchTerm(value); }, [value]);

  const filtered = availableProducts
    .filter(p => p.name.toLowerCase().includes((searchTerm || '').toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 relative" ref={wrapperRef}>
      <FormLabel text={label} className="block text-xs font-bold text-gray-500 uppercase mb-1.5" />
      <div className="flex gap-2">
        <div className="relative flex-[2]">
          <input
            type="text" disabled={disabled} placeholder={placeholder} value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
            onFocus={() => !disabled && setIsOpen(true)}
            className={`w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-100 text-sm font-bold transition-all ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-green-200 text-gray-800'}`}
          />
          {!disabled && isOpen && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
              {filtered.map(product => (
                <div key={product.id} onClick={() => { onSelect(product); setIsOpen(false); }} className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-gray-700 flex justify-between group">
                  <span className="font-bold">{product.name}</span>
                  <span className="text-gray-400 text-xs group-hover:text-green-600 bg-gray-50 px-2 py-0.5 rounded font-medium">
                    {product.unitSymbol || product.unitName || (typeof product.unit === 'string' ? product.unit : '')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative flex-1">
          <select
            value={unit} disabled={disabled} onChange={(e) => onUnitChange(e.target.value)}
            className={`w-full h-full px-3 border rounded-xl outline-none text-sm font-bold appearance-none ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-green-200 text-gray-700 cursor-pointer'}`}
          >
            <option value="">Unit</option>
            {availableUnits.map(u => <option key={u.id} value={u.symbol || u.name}>{u.symbol || u.name}</option>)}
          </select>
          {!disabled && <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        </div>
      </div>
    </div>
  );
};

const Offers = () => {
  // --- HOOK ---
  const {
    offers,
    loading, // Used to maybe show loader?
    allProducts,
    allUnits,
    redemptions,
    fetchRedemptions,
    createOffer,
    updateOffer,
    togglePause,
    deleteOffer,
    stopOffer,
    searchParties
  } = useOffers();

  // --- UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [offerSearch, setOfferSearch] = useState('');

  // --- MODAL STATE ---
  const [viewOffer, setViewOffer] = useState(null);
  // Redemptions now come from hook
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
    ruleType: 'cart_value',
    buyProductName: '', buyProductUnit: '', buyQty: '1',
    getProductName: '', getProductUnit: '', getQty: '1',
    discountType: 'percentage', discountValue: '', minPurchase: '',
    usageType: 'unlimited', usageLimitCount: '1',
    targetType: 'all', minVisits: '5', frequentDuration: '30',
    topSpenderCount: '5', topSpenderDuration: '1', topSpenderUnit: 'Years',
    startDate: new Date().toISOString().split('T')[0], endDate: '',
    selectedCustomers: [],
    colorTheme: THEME_COLORS[0].classes
  };

  const [formData, setFormData] = useState(initialForm);
  const [customerSearch, setCustomerSearch] = useState('');
  const [activeCustomerFilter, setActiveCustomerFilter] = useState('All');

  // Removed local data states (offers, allProducts, etc.) as they are in hook

  // --- EFFECT: VIEW REDEMPTIONS ---
  useEffect(() => {
    if (viewOffer) {
      fetchRedemptions(viewOffer._id || viewOffer.id);
    } else {
      fetchRedemptions(null); // Clear
    }
  }, [viewOffer, fetchRedemptions]);

  // --- CUSTOMER SEARCH ---
  const [searchedCustomers, setSearchedCustomers] = useState([]);

  useEffect(() => {
    const performSearch = async () => {
      const results = await searchParties({
        targetType: formData.targetType,
        topSpenderCount: formData.topSpenderCount,
        minVisits: formData.minVisits,
        customerSearch
      });
      setSearchedCustomers(results);
    };
    const debounce = setTimeout(performSearch, 500);
    return () => clearTimeout(debounce);
  }, [customerSearch, formData.targetType, formData.topSpenderCount, formData.minVisits, searchParties]);

  const getEligibleCustomers = () => searchedCustomers;

  // --- ANALYTICS ---
  // Simple client-side counts based on fetched data
  const activeOffersCount = offers.filter(o => o.status === 'active').length;
  const totalRedeemed = offers.reduce((sum, offer) => sum + (offer.usageCount || 0), 0);
  const totalDiscountValue = 0; // Not available in basic schema yet

  // --- HANDLERS ---
  const handleCreateNew = () => { setEditingOfferId(null); setFormData(initialForm); setErrors({}); setIsModalOpen(true); };

  const handleDuplicate = (offer, e) => {
    e.stopPropagation();
    setEditingOfferId(null);
    setErrors({});

    // Sanitize Data similar to handleEdit
    const safeForm = {
      ...initialForm,
      ...offer,
      id: '',
      name: `${offer.name} (Copy)`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'paused',
      usage: 0,
      // Ensure Defaults for optional fields
      buyProductName: offer.buyProductName || '',
      buyProductUnit: offer.buyProductUnit || '',
      buyQty: offer.buyQty || '1',
      getProductName: offer.getProductName || '',
      getProductUnit: offer.getProductUnit || '',
      getQty: offer.getQty || '1',
      minPurchase: offer.minPurchase || '',
      discountValue: offer.discountValue || '',
      usageLimitCount: offer.usageLimitCount || '1',
      topSpenderCount: offer.topSpenderCount || '5',
      topSpenderDuration: offer.topSpenderDuration || '1',
      minVisits: offer.minVisits || '5',
      frequentDuration: offer.frequentDuration || '30',
      selectedCustomers: offer.selectedCustomers || []
    };

    setFormData(safeForm);
    setIsModalOpen(true);
  };

  const handleEdit = (offer, e) => {
    e.stopPropagation();
    setEditingOfferId(offer.id);
    setErrors({});

    // Sanitize and Format Data
    const safeForm = {
      ...initialForm,
      ...offer,
      // Fix Dates (ISO to yyyy-MM-dd)
      startDate: offer.startDate ? offer.startDate.split('T')[0] : '',
      endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
      // Ensure Defaults for optional fields
      buyProductName: offer.buyProductName || '',
      buyProductUnit: offer.buyProductUnit || '',
      buyQty: offer.buyQty || '1',
      getProductName: offer.getProductName || '',
      getProductUnit: offer.getProductUnit || '',
      getQty: offer.getQty || '1',
      minPurchase: offer.minPurchase || '',
      discountValue: offer.discountValue || '',
      usageLimitCount: offer.usageLimitCount || '1',
      topSpenderCount: offer.topSpenderCount || '5',
      topSpenderDuration: offer.topSpenderDuration || '1',
      minVisits: offer.minVisits || '5',
      frequentDuration: offer.frequentDuration || '30',
      selectedCustomers: offer.selectedCustomers || []
    };

    setFormData(safeForm);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Offer Name is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";

    // Rule Specific Validation
    if (formData.ruleType === 'cart_value') {
      if (!formData.minPurchase) newErrors.minPurchase = "Min Bill Amount is required";
      if (!formData.discountValue) newErrors.discountValue = "Discount value is required";
    } else if (formData.ruleType === 'product_disc') {
      if (!formData.buyProductName) newErrors.buyProductName = "Product is required";
      if (!formData.discountValue) newErrors.discountValue = "Discount is required";
    } else if (formData.ruleType === 'bogo') {
      if (!formData.buyProductName) newErrors.buyProductName = "Buy product is required";
      if (!formData.getProductName) newErrors.getProductName = "Get product is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      let success = false;
      if (editingOfferId) {
        success = await updateOffer(editingOfferId, formData);
      } else {
        success = await createOffer(formData);
      }

      if (success) {
        setIsModalOpen(false);
      }
    } catch (err) {
      // toast handled in hook
    }
  };

  const handlePauseToggle = async (id, currentStatus, e) => {
    e.stopPropagation();
    await togglePause(id, currentStatus);
  };

  const initiateStop = (offer, e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, type: 'stop', offerId: offer.id, offerName: offer.name }); };
  const initiateDelete = (offer, e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, type: 'delete', offerId: offer.id, offerName: offer.name }); };

  const confirmAction = async () => {
    try {
      if (confirmModal.type === 'stop') {
        await stopOffer(confirmModal.offerId);
      } else {
        await deleteOffer(confirmModal.offerId);
      }
    } catch (err) {
      // toast handled in hook
    }
    setConfirmModal({ isOpen: false, type: null, offerId: null, offerName: '' });
  };

  const toggleCustomerSelection = (id) => {
    const current = formData.selectedCustomers;
    setFormData({ ...formData, selectedCustomers: current.includes(id) ? current.filter(cid => cid !== id) : [...current, id] });
  };

  const getFilteredOffers = () => {
    let filtered = offers.filter(o => (activeTab === 'all' || o.status === activeTab) && o.name.toLowerCase().includes(offerSearch.toLowerCase()));
    // Sort by date (descending)
    return filtered.sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt));
  };

  const getStatusColor = (status) => ({ active: 'bg-green-100 text-green-700', scheduled: 'bg-yellow-100 text-yellow-700', expired: 'bg-red-100 text-red-700', paused: 'bg-orange-100 text-orange-700' }[status] || 'bg-gray-100 text-gray-500');

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-bold text-gray-800">Smart Offers</h1><p className="text-sm text-gray-500 mt-1">Manage promotions and auto-apply discounts</p></div>
        <button onClick={handleCreateNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]"><Plus size={18} /> Create Offer</button>
      </div>

      {/* --- DYNAMIC ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Active Offers" value={activeOffersCount} icon={Tag} iconColor="bg-green-50 text-green-600" borderColor="border-green-100" />
        <StatCard label="Redeemed" value={totalRedeemed} icon={Users} iconColor="bg-blue-50 text-blue-600" borderColor="border-blue-100" />
        <StatCard label="Discount Given" value={totalDiscountValue} icon={Gift} iconColor="bg-orange-50 text-orange-600" borderColor="border-orange-100" />
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <TabsBar tabs={['all', 'active', 'paused', 'scheduled', 'expired']} activeTab={activeTab} onTabChange={setActiveTab} variant="default" className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto" />
        <SearchBar placeholder="Search offers..." value={offerSearch} onChange={(e) => setOfferSearch(e.target.value)} className="w-full md:w-64" />
      </div>

      {/* OFFERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredOffers().map((offer) => (
          <div key={offer.id} onClick={() => setViewOffer(offer)} className={`bg-white rounded-2xl border transition-all hover:shadow-md cursor-pointer group ${offer.status === 'expired' || offer.status === 'paused' ? 'border-gray-100 opacity-70' : 'border-green-100 shadow-sm'}`}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${offer.colorTheme || 'bg-gray-100 text-gray-600'}`}>
                  {offer.ruleType === 'bogo' ? <Gift size={20} /> :
                    offer.discountType === 'flat' ? <IndianRupee size={20} /> :
                      offer.discountType === 'percentage' ? <Percent size={20} /> : <Tag size={20} />}
                </div>
                {['active', 'paused'].includes(offer.status) && (
                  <button
                    title={offer.status === 'active' ? "Pause Offer" : "Activate Offer"}
                    onClick={(e) => handlePauseToggle(offer.id, offer.status, e)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${offer.status === 'active' ? 'bg-green-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${offer.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">{offer.name}</h3>
              <p className="text-sm font-medium text-gray-500 mb-4">{offer.description}</p>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold bg-gray-50 p-2 rounded-lg text-gray-600"><Users size={14} className="text-blue-500" /><span>{offer.targetType}</span></div>
                <div className="flex items-center gap-2 text-xs font-bold bg-gray-50 p-2 rounded-lg text-gray-600"><Receipt size={14} className="text-orange-500" /><span>Used {offer.usageCount || 0} times</span></div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-3 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${getStatusColor(offer.status)}`}>{offer.status.toUpperCase()}</span>

              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button title="Duplicate Offer" onClick={(e) => handleDuplicate(offer, e)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Copy size={16} /></button>
                <button title="Edit Offer" onClick={(e) => handleEdit(offer, e)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                {['active', 'paused', 'scheduled'].includes(offer.status) && (
                  <button title="Stop Offer Permanently" onClick={(e) => initiateStop(offer, e)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    <StopCircle size={16} />
                  </button>
                )}
                <button title="Delete Offer" onClick={(e) => initiateDelete(offer, e)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-bold text-gray-800">{editingOfferId ? 'Edit Offer' : 'Create New Offer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors bg-white shadow-sm"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto scrollbar-hover space-y-8 flex-1">

              {/* Section 1: Basic & Type */}
              <div className="space-y-4">
                <div>
                  <FormLabel text="Offer Name" required={true} className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5" />
                  <div className="flex gap-2">
                    <input ref={nameInputRef} type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: null }); }} placeholder="e.g. Diwali Dhamaka Sale" className={`flex-1 px-4 py-3 bg-gray-50 border rounded-xl font-bold outline-none focus:bg-white focus:ring-4 transition-all ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-50' : 'border-transparent focus:border-green-500 focus:ring-green-50'}`} />
                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 gap-1">
                      {THEME_COLORS.map(theme => (
                        <button key={theme.id} type="button" onClick={() => setFormData({ ...formData, colorTheme: theme.classes })} className={`w-8 h-full rounded-lg transition-all ${theme.classes} ${formData.colorTheme === theme.classes ? 'ring-2 ring-offset-2 ring-gray-400 scale-105' : 'opacity-60 hover:opacity-100'}`}></button>
                      ))}
                    </div>
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold"><AlertCircle size={12} /> {errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel text="Start Date" required={true} className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5" />
                    <input ref={dateInputRef} type="date" value={formData.startDate} onChange={(e) => { setFormData({ ...formData, startDate: e.target.value }); setErrors({ ...errors, startDate: null }); }} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl font-bold outline-none focus:bg-white focus:ring-4 transition-all ${errors.startDate ? 'border-red-500 focus:border-red-500 focus:ring-red-50' : 'border-transparent focus:border-green-500 focus:ring-green-50'}`} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5 ">
                      <FormLabel text="End Date" className="block text-xs font-bold text-gray-400 uppercase tracking-wider" />
                      {!formData.endDate ? (
                        <button type="button" onClick={() => setFormData({ ...formData, endDate: new Date().toISOString().split('T')[0] })} className="text-[10px] font-bold text-green-600 hover:underline">+ Set Date</button>
                      ) : (
                        <button type="button" onClick={() => setFormData({ ...formData, endDate: '' })} className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1"><X size={10} /> Clear Date</button>
                      )}
                    </div>
                    {formData.endDate ? (
                      <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl font-bold outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all" />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl font-medium text-gray-400 text-sm flex items-center justify-center">No End Date (Ongoing)</div>
                    )}
                  </div>
                </div>

                <div>
                  <FormLabel text="Rule Type" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4" />
                  <p className="text-[10px] text-gray-400 font-medium mb-2 flex items-center gap-1"><AlertCircle size={10} /> Note: You can only apply one rule type per offer.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['cart_value', 'product_disc', 'bogo'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          // Clear rule-specific fields on switch
                          setFormData({
                            ...formData,
                            ruleType: type,
                            // Reset all rule fields
                            minPurchase: '',
                            discountValue: '',
                            discountType: 'percentage',
                            buyProductName: '', buyProductUnit: '', buyQty: '1',
                            getProductName: '', getProductUnit: '', getQty: '1'
                          });
                          // Clear validations
                          setErrors({});
                        }}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${formData.ruleType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {type === 'cart_value' ? 'Bill Amount' : type === 'product_disc' ? 'Product Disc.' : 'Buy X Get Y'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Rule Engine */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                {formData.ruleType === 'cart_value' && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div>
                      <FormLabel text="Min Bill Amount (₹)" className="block text-xs font-bold text-gray-500 uppercase mb-1.5" />
                      <input type="number" min="0" placeholder="e.g. 500" value={formData.minPurchase} onChange={(e) => { if (e.target.value >= 0) { setFormData({ ...formData, minPurchase: e.target.value }); setErrors({ ...errors, minPurchase: null }) } }} className={`w-full px-4 py-3 bg-white border rounded-xl outline-none focus:border-green-500 font-bold ${errors.minPurchase ? 'border-red-500' : 'border-gray-200'}`} />
                      {errors.minPurchase && <p className="text-red-500 text-xs mt-1 font-bold">{errors.minPurchase}</p>}
                    </div>
                    <div>
                      <FormLabel text="Discount" className="block text-xs font-bold text-gray-500 uppercase mb-1.5" />
                      <div className="flex">
                        <input type="number" min="0" value={formData.discountValue} onChange={e => { if (e.target.value >= 0) { setFormData({ ...formData, discountValue: e.target.value }); setErrors({ ...errors, discountValue: null }) } }} className={`w-full px-4 py-3 bg-white border rounded-l-xl outline-none focus:border-green-500 font-bold ${errors.discountValue ? 'border-red-500' : 'border-gray-200'}`} />
                        <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })} className="bg-gray-200 rounded-r-xl px-3 font-bold text-gray-700 outline-none"><option value="percentage">%</option><option value="flat">₹</option></select>
                      </div>
                      {errors.discountValue && <p className="text-red-500 text-xs mt-1 font-bold">{errors.discountValue}</p>}
                    </div>
                  </div>
                )}
                {formData.ruleType === 'product_disc' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <ProductSearch label="If Customer Buys" placeholder="e.g. Sugar" value={formData.buyProductName} unit={formData.buyProductUnit} onSelect={(p) => { const u = allUnits.find(unit => unit.id === p.unitId); setFormData({ ...formData, buyProductName: p.name, buyProductUnit: u ? (u.symbol || u.name) : (p.unitSymbol || p.unitName || '') }); setErrors({ ...errors, buyProductName: null }); }} onUnitChange={(u) => setFormData({ ...formData, buyProductUnit: u })} availableProducts={allProducts} availableUnits={allUnits} />
                        {errors.buyProductName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.buyProductName}</p>}
                      </div>
                      <div className="w-24"><FormLabel text="Min Qty" className="block text-xs font-bold text-gray-500 uppercase mb-1.5" /><input type="number" min="1" placeholder="1" value={formData.buyQty} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, buyQty: e.target.value }) }} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none font-bold" /></div>
                    </div>
                    <div>
                      <FormLabel text="Give Discount" className="block text-xs font-bold text-gray-500 uppercase mb-1.5" />
                      <div className="flex w-1/2">
                        <input type="number" min="0" value={formData.discountValue} onChange={e => { if (e.target.value >= 0) { setFormData({ ...formData, discountValue: e.target.value }); setErrors({ ...errors, discountValue: null }) } }} className={`w-full px-4 py-3 bg-white border rounded-l-xl outline-none focus:border-green-500 font-bold ${errors.discountValue ? 'border-red-500' : 'border-gray-200'}`} />
                        <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })} className="bg-gray-200 rounded-r-xl px-3 font-bold text-gray-700 outline-none"><option value="percentage">%</option><option value="flat">₹</option></select>
                      </div>
                      {errors.discountValue && <p className="text-red-500 text-xs mt-1 font-bold">{errors.discountValue}</p>}
                    </div>
                  </div>
                )}
                {formData.ruleType === 'bogo' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <ProductSearch label="Buy" placeholder="e.g. Biscuits" value={formData.buyProductName} unit={formData.buyProductUnit} onSelect={(p) => { const u = allUnits.find(unit => unit.id === p.unitId); setFormData({ ...formData, buyProductName: p.name, buyProductUnit: u ? (u.symbol || u.name) : (p.unitSymbol || p.unitName || '') }); setErrors({ ...errors, buyProductName: null }); }} onUnitChange={(u) => setFormData({ ...formData, buyProductUnit: u })} availableProducts={allProducts} availableUnits={allUnits} />
                        {errors.buyProductName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.buyProductName}</p>}
                      </div>
                      <div className="w-24"><FormLabel text="Qty" className="block text-xs font-bold text-gray-500 uppercase mb-1.5" /><input type="number" min="1" placeholder="1" value={formData.buyQty} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, buyQty: e.target.value }) }} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none font-bold" /></div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase my-1"><ArrowDownIcon /> Then Get Free</div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <ProductSearch label="Get Free" placeholder="e.g. Maggi" value={formData.getProductName} unit={formData.getProductUnit} onSelect={(p) => { const u = allUnits.find(unit => unit.id === p.unitId); setFormData({ ...formData, getProductName: p.name, getProductUnit: u ? (u.symbol || u.name) : (p.unitSymbol || p.unitName || '') }); setErrors({ ...errors, getProductName: null }); }} onUnitChange={(u) => setFormData({ ...formData, getProductUnit: u })} availableProducts={allProducts} availableUnits={allUnits} />
                        {errors.getProductName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.getProductName}</p>}
                      </div>
                      <div className="w-24"><FormLabel text="Qty" className="block text-xs font-bold text-gray-500 uppercase mb-1.5" /><input type="number" min="1" placeholder="1" value={formData.getQty} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, getQty: e.target.value }) }} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none font-bold" /></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Usage Limits */}
              <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 space-y-3">
                <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-2"><Repeat size={16} /> Usage Limit per Customer</h3>
                <div className="flex gap-4">{['single', 'unlimited', 'limited'].map(type => (<label key={type} className="flex items-center gap-2 cursor-pointer capitalize"><input type="radio" checked={formData.usageType === type} onChange={() => setFormData({ ...formData, usageType: type })} className="text-green-600 focus:ring-green-500 w-4 h-4" /><span className="text-sm font-bold text-gray-700">{type === 'single' ? '1 Time' : type === 'limited' ? 'Custom' : 'Unlimited'}</span></label>))}</div>
                {formData.usageType === 'limited' && (<div className="flex items-center gap-2 animate-in slide-in-from-top-2"><input type="number" min="1" value={formData.usageLimitCount} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, usageLimitCount: e.target.value }) }} className="w-20 px-3 py-2 font-bold bg-white border border-yellow-200 rounded-lg outline-none focus:border-green-500" /><span className="text-sm font-bold text-gray-500">times per customer</span></div>)}
              </div>

              {/* Section 4: Target Audience */}
              <div className="space-y-4">
                <FormLabel text="Who is this offer for?" className="block text-xs font-bold text-gray-400 uppercase tracking-wider" />
                <select value={formData.targetType} onChange={(e) => setFormData({ ...formData, targetType: e.target.value, selectedCustomers: [] })} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl font-bold outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50"><option value="all">All Customers</option><option value="top_spenders">Top Spenders</option><option value="frequent">Frequent Visitors</option><option value="specific">Specific Customers</option></select>

                {formData.targetType === 'top_spenders' && (
                  <div className="flex flex-wrap items-center gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100"><span className="text-sm font-bold text-purple-800">Top</span><input type="number" min="1" value={formData.topSpenderCount} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, topSpenderCount: e.target.value }) }} className="w-20 px-3 py-1.5 bg-white border border-purple-200 font-bold rounded-lg text-center" /><span className="text-sm font-bold text-purple-800">Customers in last</span><input type="number" min="1" value={formData.topSpenderDuration} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, topSpenderDuration: e.target.value }) }} className="w-20 px-3 py-1.5 bg-white border border-purple-200 font-bold rounded-lg text-center" /><select value={formData.topSpenderUnit} onChange={(e) => setFormData({ ...formData, topSpenderUnit: e.target.value })} className="px-3 py-1.5 bg-white border border-purple-200 rounded-lg font-bold text-sm"><option>Years</option><option>Months</option><option>Weeks</option><option>Days</option></select></div>
                )}

                {formData.targetType === 'frequent' && (
                  <div className="flex flex-wrap items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100"><span className="text-sm font-bold text-blue-800">More than</span><input type="number" min="1" value={formData.minVisits} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, minVisits: e.target.value }) }} className="w-20 px-3 py-1.5 bg-white border border-blue-200 font-bold rounded-lg text-center" /><span className="text-sm font-bold text-blue-800">visits in last</span><input type="number" min="1" value={formData.frequentDuration} onChange={(e) => { if (e.target.value >= 0) setFormData({ ...formData, frequentDuration: e.target.value }) }} className="w-20 px-3 py-1.5 bg-white border border-blue-200 font-bold rounded-lg text-center" /><span className="text-sm font-bold text-blue-800">days.</span></div>
                )}

                {['specific', 'top_spenders', 'frequent'].includes(formData.targetType) && (
                  <div ref={customerListRef} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                    <div className="flex flex-col gap-3 mb-3">
                      <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search customer..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
                      {formData.targetType === 'specific' && (<div className="flex gap-2">{['All', 'Frequent', 'Top Spender', 'Regular'].map(filter => (<button key={filter} onClick={() => setActiveCustomerFilter(filter)} className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${activeCustomerFilter === filter ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{filter}</button>))}</div>)}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-hover">
                      {getEligibleCustomers().map(cust => (
                        <div key={cust.id} onClick={() => toggleCustomerSelection(cust.id)} className={`flex items-center justify-between p-3 bg-white border rounded-xl cursor-pointer transition-all ${formData.selectedCustomers.includes(cust.id) ? 'border-green-500 ring-2 ring-green-100 bg-green-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.selectedCustomers.includes(cust.id) ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>{formData.selectedCustomers.includes(cust.id) && <Check size={14} className="text-white font-bold" />}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{cust.name}</p>
                              <p className="text-xs text-gray-500 font-medium">{cust.phoneNumber}</p>
                            </div>
                          </div>
                          {cust.totalSpent != null && <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">₹{cust.totalSpent}</span>}
                          {cust.visitCount != null && <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{cust.visitCount} visits</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </form>

            <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all">{editingOfferId ? 'Update Offer' : 'Create Offer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${confirmModal.type === 'delete' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{confirmModal.type === 'delete' ? <Trash2 size={24} /> : <StopCircle size={24} />}</div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">{confirmModal.type === 'delete' ? 'Delete Offer?' : 'Stop Offer?'}</h3>
            <p className="text-gray-500 text-sm text-center mb-6">{confirmModal.type === 'delete' ? `Permanently delete "${confirmModal.offerName}"?` : `Stop "${confirmModal.offerName}"? It will be marked as expired.`}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ isOpen: false, type: null, offerId: null })} className="flex-1 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100">Cancel</button>
              <button onClick={confirmAction} className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all ${confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'}`}>{confirmModal.type === 'delete' ? 'Delete' : 'Stop'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS & REDEMPTIONS MODAL --- */}
      {viewOffer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div><h2 className="text-xl font-bold text-gray-800">{viewOffer.name}</h2><p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${viewOffer.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>{viewOffer.status.toUpperCase()} • {formatDate(viewOffer.startDate)} to {formatDate(viewOffer.endDate)}</p></div>
              <button onClick={() => setViewOffer(null)} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 shadow-sm border border-gray-200"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-xs text-blue-600 font-bold uppercase mb-1">Offer Value</p><p className="text-2xl font-extrabold text-gray-800">{viewOffer.value}</p><p className="text-xs font-medium text-gray-500 mt-1">{viewOffer.rule}</p></div>
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100"><p className="text-xs text-purple-600 font-bold uppercase mb-1">Target Audience</p><p className="text-2xl font-extrabold text-gray-800 truncate">{viewOffer.target}</p><p className="text-xs font-medium text-gray-500 mt-1 capitalize">Limit: {viewOffer.usageType}</p></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2"><Receipt size={16} /> Recent Redemptions ({viewOffer.usage})</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase"><tr><th className="p-4">Customer</th><th className="p-4">Last Used</th><th className="p-4">Times Used</th><th className="p-4 text-right">Total Saved</th></tr></thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {redemptions.length > 0 ? (
                        redemptions.map(r => (
                          <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-gray-800">{r.partyName || 'Walk-in'}</p>
                              {r.customerId && r.customerId !== 'walk-in' && <p className="text-xs text-gray-400">ID: {r.customerId}</p>}
                            </td>
                            <td className="p-4 text-gray-600">
                              {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              <p className="text-xs text-gray-400">{new Date(r.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Redeemed</span></td>
                            <td className="p-4 text-right font-bold text-green-600">₹{r.discountAmount ? r.discountAmount.toFixed(2) : '0.00'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-400">No redemptions yet.</td></tr>
                      )}
                    </tbody>
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

const ArrowDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
)

export default Offers;