import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Save, Share2, Plus, Trash2, Calendar,
  Search, Zap, CheckCircle2, X, Gift, History, Ticket, PartyPopper
} from 'lucide-react';
import FormLabel from '../../components/common/FormLabel';
import api from '../../src/api';


const WalkInModal = ({ isOpen, onClose, onSave }) => {
  const [details, setDetails] = useState({ name: '', phone: '', address: '', gstin: '', state: '' });
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Walk-in Customer Details</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><FormLabel text="Name" className="text-xs font-bold text-gray-500 uppercase" /><input type="text" className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-green-500 font-medium" autoFocus value={details.name} onChange={e => setDetails({ ...details, name: e.target.value })} /></div>
            <div><FormLabel text="Phone" className="text-xs font-bold text-gray-500 uppercase" /><input type="text" className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-green-500 font-medium" value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} /></div>
          </div>
          <div><FormLabel text="Address" className="text-xs font-bold text-gray-500 uppercase" /><input type="text" className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-green-500 font-medium" value={details.address} onChange={e => setDetails({ ...details, address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><FormLabel text="GSTIN" className="text-xs font-bold text-gray-500 uppercase" /><input type="text" className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-green-500 font-medium" value={details.gstin} onChange={e => setDetails({ ...details, gstin: e.target.value })} /></div>
            <div><FormLabel text="State" className="text-xs font-bold text-gray-500 uppercase" /><input type="text" className="w-full border-b border-gray-300 py-1.5 outline-none focus:border-green-500 font-medium" value={details.state} onChange={e => setDetails({ ...details, state: e.target.value })} /></div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Skip</button>
          <button onClick={() => onSave(details)} className="px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md">Save Details</button>
        </div>
      </div>
    </div>
  );
};

const NewTransaction = ({ type = 'sale' }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isSale = type === 'sale';

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Theme
  const theme = {
    primary: isSale ? 'bg-green-600' : 'bg-red-600',
    primaryHover: isSale ? 'hover:bg-green-700' : 'hover:bg-red-700',
    secondary: isSale ? 'bg-green-50' : 'bg-red-50',
    text: isSale ? 'text-green-600' : 'text-red-600',
    border: isSale ? 'focus:ring-green-200' : 'focus:ring-red-200',
  };

  // --- STATE ---
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInDetails, setWalkInDetails] = useState(null);

  // Initialize with Local Date (not UTC) to avoid timezone issues
  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [products, setProducts] = useState([{ id: Date.now(), name: '', qty: 1, price: '', amount: 0, isFree: false, manual: false }]);
  const [paidAmount, setPaidAmount] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // Calculated State
  const [appliedOffers, setAppliedOffers] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [removedOfferIds, setRemovedOfferIds] = useState([]);
  const [totals, setTotals] = useState({ sub: 0, disc: 0, total: 0 });

  // UI State
  const [custSearch, setCustSearch] = useState('');
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  const [focusedRowId, setFocusedRowId] = useState(null);

  // Data State
  const [customerList, setCustomerList] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);

  // Refs
  const custInputRef = useRef(null);
  const productRefs = useRef({});

  // --- EFFECTS ---
  // Handle Edit Mode Pre-fill
  useEffect(() => {
    if (state && state.mode === 'edit' && state.transaction) {
      const t = state.transaction;
      setEditMode(true);
      setEditingId(t.id);

      // Parse Date (Ensure YYYY-MM-DD)
      setDate(t.date);

      // Set Customer
      // Assuming 't' has partyId and party (name)
      if (t.partyId) {
        setSelectedCustomer({ id: t.partyId, name: t.party });
      } else {
        // Handle walk-in logic if needed, or fallback
        setSelectedCustomer({ id: 'walk-in', name: t.party });
      }

      // Map Details to Products
      const mappedProducts = t.details.map((d, i) => ({
        id: Date.now() + i,
        name: d.name,
        qty: parseFloat(d.qty),
        price: parseFloat(d.rate),
        amount: parseFloat(d.total),
        productId: d.productId,
        isFree: d.isFree || false,
        manual: false
      }));

      setProducts(mappedProducts);
      setPaidAmount(t.paidAmount);

      // Note: We don't pre-fill offers state explicitly as the 'useEffect' calculation
      // logic below should ideally re-calculate them based on the products.
      // However, if the transaction was saved with specific offers, re-calculating might
      // change things if offers expired. 
      // For now, we allow re-calculation to ensure consistency with current rules.
    }
  }, [state]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (custInputRef.current && !custInputRef.current.contains(event.target)) setIsCustDropdownOpen(false);
      if (!event.target.closest('.product-row-wrapper')) setFocusedRowId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Customer Search Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/parties?search=${custSearch}`);
        setCustomerList(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [custSearch]);

  // Fetch All Products on Mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data } = await api.get('/trading/products');
        // Sort A-Z
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setAllProducts(sorted);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchResources();
  }, []);

  const [removedOffers, setRemovedOffers] = useState([]); // Offer IDs manually removed

  // --- EFFECT: Calculate Totals & Offers via Backend ---
  useEffect(() => {
    if (!isSale) {
      const sub = products.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.qty || 0)), 0);
      setTotals({ sub, disc: 0, total: sub });
      return;
    }

    const calculateTransaction = async () => {
      try {
        const payload = {
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            qty: p.qty,
            price: p.price,
            productId: p.productId,
            isFree: p.isFree
          })),
          customerId: selectedCustomer?.id === 'walk-in' ? null : selectedCustomer?.id,
          date: date,
          excludedOffers: removedOffers // Pass manual exclusions
        };

        const { data } = await api.post('/smart-ops/calculate', payload);

        // data = { products, totals, appliedOffers, availableOffers }

        // 1. Update Totals
        setTotals(data.totals);
        setAppliedOffers(data.appliedOffers);
        setAvailableOffers(data.availableOffers);

        // 2. Update Products List (Merge Strategy)
        // We must preserve UI state (focus key) if possible, but data.products includes new amounts/free items.
        // The backend returns the full list including seeded free items.
        // We should replace our local 'products' with 'data.products' BUT match existing keys (row IDs).
        // My offerEngine returns the exact same objects + new free ones.
        // So we can largely just replace, provided the user isn't typing mid-request (debounce helps).

        // To avoid cursor jumping, we only replace if things actually changed?
        // For now, let's just setProducts.
        // Note: We might get new IDs for free items.

        // Optimization: Check if deep equal?
        // Let's just set it.
        setProducts(data.products);

      } catch (err) {
        console.error("Calculation error", err);
      }
    };

    // Debounce to prevent flashing while typing
    const timer = setTimeout(() => {

      calculateTransaction();
    }, 300); // 300ms delay (faster response)

    return () => clearTimeout(timer);

  }, [products.map(p => p.productId + p.qty + p.price).join(','), selectedCustomer?.id, date, isSale, removedOffers]);
  // Dependency array note: 
  // We strictly track content changes. Tracking 'products' object directly causes loop if we setProducts inside.
  // So we serialize key fields.


  // --- HANDLERS ---

  const handleAddProduct = () => {
    const lastProduct = products[products.length - 1];
    // If last row is empty and not free, focus it instead of adding new
    if (lastProduct && lastProduct.name === '' && !lastProduct.isFree) {
      if (productRefs.current[`name-${lastProduct.id}`]) productRefs.current[`name-${lastProduct.id}`].focus();
      return;
    }
    const newId = Date.now();
    setProducts(prev => [...prev, { id: newId, name: '', qty: 1, price: '', amount: 0, isFree: false, manual: false }]);
    setTimeout(() => { if (productRefs.current[`name-${newId}`]) productRefs.current[`name-${newId}`].focus(); }, 50);
  };

  const handleRemoveProduct = (id, isOfferRemoval = false) => {
    if (isOfferRemoval) {
      const product = products.find(i => i.id === id);
      if (product && product.offerId) setRemovedOfferIds(prev => [...prev, product.offerId]);
      setProducts(prev => prev.filter(i => i.id !== id));
    } else {
      if (products.length === 1 && !products[0].isFree) {
        // Clear last row
        setProducts([{ id: Date.now(), name: '', qty: 1, price: '', amount: 0, isFree: false, manual: false }]);
      } else {
        setProducts(prev => prev.filter(i => i.id !== id));
      }
    }
  };

  const handleUpdateProduct = async (id, field, value) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        if (field === 'qty' && value < 1) return product;
        const updatedProduct = { ...product, [field]: value };
        if (product.isFree) updatedProduct.manual = true;
        updatedProduct.amount = (Number(updatedProduct.qty) || 0) * (Number(updatedProduct.price) || 0);
        return updatedProduct;
      }
      return product;
    }));

    // Product Search (Local Filtering)
    if (field === 'name') {
      // Clear productId if name changes (so we don't submit mismatched ID)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, productId: null, name: value } : p));

      const filtered = value.length > 0
        ? allProducts.filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        : allProducts;
      setSearchProducts(filtered);
    }
  };

  const handleProductSelect = (rowId, product) => {
    setProducts(prev => prev.map(item => {
      if (item.id === rowId) {
        // Keep item.id (rowId) for React Key, store product.id as productId for DB
        return { ...item, productId: product.id, name: product.name, price: product.price, amount: (Number(item.qty) || 1) * (Number(product.price) || 0) };
      }
      return item;
    }));
    setFocusedRowId(null);
    // Auto focus Qty after select
    setTimeout(() => { if (productRefs.current[`qty-${rowId}`]) productRefs.current[`qty-${rowId}`].focus(); }, 50);
  };

  const handleWalkInSave = (details) => {
    setWalkInDetails(details);
    setShowWalkInModal(false);
  };

  const handleCustomerSelect = (c) => {
    setSelectedCustomer(c);
    setIsCustDropdownOpen(false);
    setCustSearch('');
    if (c.id === 'walk-in') setShowWalkInModal(true);
  };

  const filteredCustomers = [
    { id: 'walk-in', name: 'Walk-in Customer', phone: '', type: 'Regular' },
    ...customerList
  ].filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || (c.phone && c.phone.includes(custSearch)));

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <WalkInModal isOpen={showWalkInModal} onClose={() => setShowWalkInModal(false)} onSave={handleWalkInSave} />

      {/* Notification Toast */}
      {notification.message && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
          {notification.type === 'error' ? <X size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">New Activity</h1>
          <div className="bg-white p-1.5 rounded-xl inline-flex border border-gray-200 shadow-sm">
            <button onClick={() => navigate('/new-sale')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${isSale ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Sale</button>
            <button onClick={() => navigate('/new-purchase')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${!isSale ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Purchase</button>
          </div>
        </div>

        {/* --- ADDED HISTORY BUTTON --- */}
        <button
          onClick={() => navigate('/transactions')}
          className="p-3 bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl shadow-sm transition-all"
          title="View History"
        >
          <History size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Party Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div ref={custInputRef} className="relative">
                <FormLabel text="Select Party" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide" />
                <div className="relative">
                  <input
                    type="text"
                    placeholder={selectedCustomer ? selectedCustomer.name : "Search Party..."}
                    value={custSearch}
                    onChange={(e) => { setCustSearch(e.target.value); setIsCustDropdownOpen(true); }}
                    onClick={() => setIsCustDropdownOpen(true)}
                    className={`w-full p-3 pl-10 bg-gray-50 border-none rounded-xl text-gray-800 font-bold focus:ring-2 ${theme.border} outline-none`}
                  />
                  <Search className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                  {/* Badge */}
                  {selectedCustomer && !custSearch && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center pl-10 pr-10 pointer-events-none bg-white rounded-xl">
                      <span className="text-gray-800 font-bold">{selectedCustomer.name}</span>
                      {selectedCustomer.id === 'walk-in' && walkInDetails && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={10} /> Details Added</span>}
                    </div>
                  )}
                  {selectedCustomer && <button onClick={() => { setSelectedCustomer(null); setCustSearch(''); }} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500 z-10"><X size={18} /></button>}

                  {isCustDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                      {filteredCustomers.map(c => (
                        <div key={c.id} onMouseDown={() => handleCustomerSelect(c)} className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0">
                          <div><p className="text-sm font-bold text-gray-700">{c.name}</p><p className="text-xs text-gray-400">{c.phone}</p></div>
                          {c.type === 'Top Spender' && <Zap size={14} className="text-yellow-500 fill-yellow-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <FormLabel text="Date" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide" />
                <div className="relative"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-full p-3 bg-gray-50 border-none rounded-xl text-gray-800 font-medium focus:ring-2 ${theme.border} outline-none`} /><Calendar className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} /></div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-gray-800">Products</h3><button onClick={handleAddProduct} className={`text-sm font-medium ${theme.text} hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1`}><Plus size={16} /> Add Product</button></div>
            <div className="grid grid-cols-12 gap-4 mb-3 px-2">
              <div className="col-span-5 text-xs font-medium text-gray-400 uppercase">Product Name</div>
              <div className="col-span-2 text-xs font-medium text-gray-400 uppercase text-right">Qty</div>
              <div className="col-span-2 text-xs font-medium text-gray-400 uppercase text-right">Price</div>
              <div className="col-span-2 text-xs font-medium text-gray-400 uppercase text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-2 flex-1">
              {products.map((product, index) => (
                <div key={product.id} className={`grid grid-cols-12 gap-4 items-center group product-row-wrapper ${product.isFree ? 'bg-amber-50/60 -mx-2 px-2 py-1.5 rounded-lg border-l-4 border-amber-400' : ''}`}>
                  <div className="col-span-5 relative">
                    <input
                      ref={(el) => (productRefs.current[`name-${product.id}`] = el)}
                      type="text"
                      placeholder="Product name"
                      value={product.name || ''}
                      onFocus={() => { if (!product.isFree) { setFocusedRowId(product.id); setSearchProducts(product.name ? allProducts.filter(p => p.name.toLowerCase().includes(product.name.toLowerCase())) : allProducts); } }}
                      onClick={() => { if (!product.isFree) { setFocusedRowId(product.id); setSearchProducts(product.name ? allProducts.filter(p => p.name.toLowerCase().includes(product.name.toLowerCase())) : allProducts); } }}
                      onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                      disabled={product.isFree}
                      className={`w-full p-2.5 bg-gray-50 rounded-lg text-sm border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none transition-all ${product.isFree ? 'bg-transparent font-bold text-amber-900' : ''}`}
                    />
                    {product.isFree && <span className="absolute right-0 top-3 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 rounded-full flex items-center gap-1"><Gift size={10} /> FREE</span>}

                    {focusedRowId === product.id && !product.isFree && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                        {searchProducts.map(p => (
                          <div key={p.id} onMouseDown={() => handleProductSelect(product.id, p)} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex justify-between"><span>{p.name}</span><span className="text-gray-400 text-xs">₹{p.price}</span></div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2"><input ref={(el) => (productRefs.current[`qty-${product.id}`] = el)} type="number" value={product.qty ?? ''} onChange={(e) => handleUpdateProduct(product.id, 'qty', e.target.value === '' ? '' : parseFloat(e.target.value))} className={`w-full p-2.5 bg-gray-50 rounded-lg text-sm text-right border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none ${product.isFree ? 'bg-white border-amber-200' : ''}`} /></div>
                  <div className="col-span-2"><input ref={(el) => (productRefs.current[`price-${product.id}`] = el)} type="number" value={product.price ?? ''} onChange={(e) => handleUpdateProduct(product.id, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))} disabled={product.isFree} className={`w-full p-2.5 bg-gray-50 rounded-lg text-sm text-right border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none ${product.isFree ? 'bg-white border-amber-200' : ''}`} /></div>
                  <div className="col-span-2 text-right font-bold text-gray-700">₹{(product.amount || 0).toLocaleString()}</div>
                  <div className="col-span-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleRemoveProduct(product.id, product.isFree)} tabIndex={-1} className={`${product.isFree ? 'text-amber-400 hover:text-red-500' : 'text-gray-300 hover:text-red-500'} p-2 rounded-full hover:bg-red-50 transition-colors`}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end items-center gap-12"><span className="text-gray-400 text-sm">Total Products: {products.length}</span><div className="text-right"><span className="block text-xs text-gray-400 uppercase mb-1">Total Bill</span><span className="text-2xl font-bold text-gray-800">₹{totals.sub.toLocaleString()}</span></div></div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-6">Payment Details</h3>
            <div className="space-y-4">

              {/* OFFERS */}
              {isSale && (
                <div className="space-y-3">
                  {availableOffers.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 border-dashed">
                      <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Available Deals</p>
                      <div className="space-y-1">{availableOffers.map((o) => (<div key={o.id} className="flex justify-between items-center text-xs text-blue-600"><span>{o.desc}</span>{removedOffers.includes(o.id) && <button onClick={() => setRemovedOffers(prev => prev.filter(id => id !== o.id))} className="text-[10px] font-bold underline hover:text-blue-800">Apply</button>}</div>))}</div>
                    </div>
                  )}
                  {appliedOffers.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                      <p className="text-[10px] font-bold text-green-700 uppercase mb-2">Applied Offers</p>
                      <div className="flex flex-col gap-2">{appliedOffers.map((o) => (<div key={o.id} className="flex justify-between items-center text-xs text-green-700 bg-white p-2 rounded border border-green-200"><span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> {o.desc}</span><button onClick={() => setRemovedOfferIds(prev => [...prev, o.id])} className="text-gray-400 hover:text-red-500"><X size={14} /></button></div>))}</div>
                    </div>
                  )}
                </div>
              )}

              <div className={`p-4 rounded-xl ${theme.secondary} border border-transparent`}>
                <div className="flex justify-between items-center mb-1"><span className={`text-sm font-medium ${theme.text}`}>Grand Total</span><span className={`text-xl font-bold ${theme.text}`}>₹{totals.total.toFixed(2)}</span></div>
                {totals.disc > 0 && (<div className="flex justify-between items-center text-xs opacity-70 mt-1"><span>Discount</span><span>- ₹{totals.disc.toFixed(2)}</span></div>)}
              </div>

              <div>
                <FormLabel text={isSale ? 'Amount Received' : 'Amount Paid'} className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide" />
                <div className="relative"><span className="absolute left-4 top-3 text-gray-400 font-medium">₹</span><input type="number" placeholder="0" value={paidAmount || ''} onChange={(e) => setPaidAmount(e.target.value)} className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 font-bold focus:ring-2 ${theme.border} outline-none transition-all`} /></div>
              </div>

              <div className="flex justify-between items-center py-2 px-1">
                <span className="text-sm text-gray-500">Balance Due</span>
                {/* Round Off Balance */}
                <span className={`font-bold ${totals.total - paidAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{Math.round(totals.total - (Number(paidAmount) || 0)).toLocaleString()}</span>
              </div>

              <hr className="border-gray-100 my-4" />
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"><Share2 size={18} /> Share</button>
                <button
                  onClick={async () => {
                    // 1. Validate Party
                    if (!selectedCustomer) { showNotify('error', "Please select a party."); return; }

                    // 2. Filter Empty Rows
                    const filledProducts = products.filter(p => p.name && p.name.trim() !== '');
                    if (filledProducts.length === 0) { showNotify('error', "Please add at least one product."); return; }

                    // 3. Validate Each Product
                    for (const p of filledProducts) {
                      if (!p.productId && !p.isFree) {
                        showNotify('error', `Product '${p.name}' not recognized. Please select it from the list.`);
                        return;
                      }
                      if (!p.qty || Number(p.qty) <= 0) {
                        showNotify('error', `Invalid quantity for '${p.name}'.`);
                        return;
                      }
                      // Allow 0 price only if it's marked as free (though isFree usually sets price to 0)
                      // If not free, price must be > 0.
                      if (!p.isFree && (!p.price || Number(p.price) < 0)) {
                        // Note: We allow 0 if user explicitly intends it, but usually standard sale has price. 
                        // But for now, let's just check it's a valid number.
                        // Actually user complained about "sell price not entered". 
                        // So let's enforce non-empty.
                        showNotify('error', `Please enter a price for '${p.name}'.`);
                        return;
                      }
                    }

                    try {
                      const payload = {
                        partyId: (selectedCustomer?.id && selectedCustomer.id !== 'walk-in') ? selectedCustomer.id : null,
                        partyName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
                        date,
                        type: isSale ? 'SALE' : 'PURCHASE',
                        products: filledProducts.map(p => {
                          let resolvedProductId = p.productId;
                          if (!resolvedProductId && p.name) {
                            const match = allProducts.find(prod => prod.name.trim().toLowerCase() === p.name.trim().toLowerCase());
                            if (match) resolvedProductId = match.id;
                          }
                          return {
                            productId: resolvedProductId,
                            qty: p.qty,
                            price: p.price,
                            amount: p.amount,
                            isFree: p.isFree
                          };
                        }),
                        subTotal: totals.sub,
                        discount: totals.disc,
                        totalAmount: totals.total,
                        paidAmount: Number(paidAmount) || 0
                      };

                      if (editMode) {
                        const { data } = await api.put(`/trading/transactions/${editingId}`, payload);
                        showNotify('success', `Transaction Updated!`);
                      } else {
                        const { data } = await api.post('/trading/transactions', payload);
                        showNotify('success', `Transaction Saved!`);
                      }
                      setTimeout(() => navigate('/transactions'), 1000);
                    } catch (err) {
                      console.error(err);
                      showNotify('error', err.response?.data?.error || 'Failed to save transaction');
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-medium shadow-lg shadow-gray-200 transition-all ${theme.primary} ${theme.primaryHover}`}
                >
                  <Save size={18} /> {editMode ? 'Update Bill' : 'Save Bill'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Offers & Summary */}
      <div className="space-y-6">

        {/* APPLIED OFFERS */}
        {appliedOffers.length > 0 && (
          <div className={`p-5 rounded-2xl border ${theme.border} bg-white shadow-sm`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 rounded-lg ${isSale ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <PartyPopper size={20} />
              </div>
              <h3 className="font-bold text-gray-800">Applied Offers</h3>
            </div>
            <div className="space-y-3">
              {appliedOffers.map((offer, idx) => (
                <div key={offer.id || idx} className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-green-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{offer.desc || offer.name}</p>
                      <p className="text-xs text-green-600 font-medium">Successfully Applied</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRemovedOffers(prev => [...prev, offer.id])}
                    className="p-1 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove Offer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVAILABLE OFFERS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Available Offers</h3>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{availableOffers.length} Active</span>
          </div>

          {availableOffers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Ticket size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No offers available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {availableOffers.map((offer) => (
                <div key={offer.id} className="group p-3 hover:bg-gray-50 border border-dashed border-gray-200 hover:border-gray-300 rounded-xl transition-all cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Ticket size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{offer.desc || offer.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{offer.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOTALS SUMMARY CARD */}
        <div className={`p-6 rounded-2xl text-white shadow-xl ${theme.primary}`}>
          <h3 className="text-lg font-medium opacity-90 mb-6">Payment Summary</h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm opacity-80"><span>Subtotal</span><span>₹{totals.sub.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm opacity-80"><span>Discount</span><span>- ₹{totals.disc.toLocaleString()}</span></div>
            <div className="h-px bg-white/20"></div>
            <div className="flex justify-between text-2xl font-bold"><span>Total</span><span>₹{totals.total.toLocaleString()}</span></div>
          </div>
        </div>

      </div>
    </div >
  );
};

export default NewTransaction;
