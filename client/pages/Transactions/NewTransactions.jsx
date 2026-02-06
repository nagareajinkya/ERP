import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Save, Plus, Trash2, Calendar, Search,
  Zap, CheckCircle2, X, Gift, History, Ticket, Share2
} from 'lucide-react';
import FormLabel from '../../components/common/FormLabel';
import api from '../../src/api';

/* ---------------- PRODUCT HISTORY MODAL ---------------- */
const ProductHistoryModal = ({ isOpen, onClose, product, sales, purchases, loading }) => {
  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0">
          <h3 className="font-bold text-gray-800">Transaction History - {product.name || 'Product'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-5 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-sm text-gray-500">Loading transaction history...</p>
              </div>
            </div>
          )}
          {!loading && (
            <>
              {/* Sales Section */}
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Last 5 Sales
                </h4>
                {sales.length > 0 ? (
                  <div className="space-y-2">
                    {sales.map((sale, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-100 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{sale.party}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {sale.qty} | Price: ₹{Number(sale.rate).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700">₹{Number(sale.total).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No sales found</p>
                )}
              </div>
              {/* Purchases Section */}
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Last 5 Purchases
                </h4>
                {purchases.length > 0 ? (
                  <div className="space-y-2">
                    {purchases.map((purchase, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{purchase.party}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {purchase.qty} | Price: ₹{Number(purchase.rate).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-700">₹{Number(purchase.total).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{new Date(purchase.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No purchases found</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- WALK-IN MODAL (Logic from Code A) ---------------- */
const WalkInModal = ({ isOpen, onClose, onSave }) => {
  const [details, setDetails] = useState({ name: '', phone: '', address: '', gstin: '', state: '' });
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-gray-800">Walk-in Customer</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name" className="w-full border-b py-2 outline-none focus:border-green-500" autoFocus value={details.name} onChange={e => setDetails({ ...details, name: e.target.value })} />
            <input placeholder="Phone" className="w-full border-b py-2 outline-none focus:border-green-500" value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} />
          </div>
          <input placeholder="Address" className="w-full border-b py-2 outline-none focus:border-green-500" value={details.address} onChange={e => setDetails({ ...details, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="GSTIN" className="w-full border-b py-2 outline-none focus:border-green-500" value={details.gstin} onChange={e => setDetails({ ...details, gstin: e.target.value })} />
            <input placeholder="State" className="w-full border-b py-2 outline-none focus:border-green-500" value={details.state} onChange={e => setDetails({ ...details, state: e.target.value })} />
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end gap-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded">Skip</button>
          <button onClick={() => onSave(details)} className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-700 shadow">Save Details</button>
        </div>
      </div>
    </div>
  );
};

/* ===================== MAIN COMPONENT ===================== */

const NewTransaction = ({ type = 'sale' }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isSale = type === 'sale';

  /* ---------- THEME CONFIG ---------- */
  const theme = {
    primary: isSale ? 'bg-green-600' : 'bg-red-600',
    primaryHover: isSale ? 'hover:bg-green-700' : 'hover:bg-red-700',
    text: isSale ? 'text-green-600' : 'text-red-600',
    lightBg: isSale ? 'bg-green-50' : 'bg-red-50',
    borderFocus: isSale ? 'focus:border-green-500' : 'focus:border-red-500',
  };

  /* ---------- STATE MANAGEMENT (From Code A) ---------- */
  // Edit Mode Logic
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Customer Data
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [custSearch, setCustSearch] = useState('');
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInDetails, setWalkInDetails] = useState(null);

  // Transaction Data
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [products, setProducts] = useState([{ id: Date.now(), name: '', qty: 1, price: '', amount: 0, isFree: false, manual: false }]);
  const [paidAmount, setPaidAmount] = useState('');

  // Resources & UI
  const [allProducts, setAllProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);
  const [focusedRowId, setFocusedRowId] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Product History
  const [showProductHistory, setShowProductHistory] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);
  const [productHistorySales, setProductHistorySales] = useState([]);
  const [productHistoryPurchases, setProductHistoryPurchases] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Offers & Calculations
  const [appliedOffers, setAppliedOffers] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [removedOfferIds, setRemovedOfferIds] = useState([]); // IDs manually removed
  const [totals, setTotals] = useState({ sub: 0, disc: 0, total: 0 });
  const [showOffers, setShowOffers] = useState(true);

  // Refs
  const custInputRef = useRef(null);
  const productRefs = useRef({});

  /* ---------- EFFECTS ---------- */

  // 1. Notification Helper
  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // 2. Edit Mode Pre-fill (From Code A)
  useEffect(() => {
    if (state && state.mode === 'edit' && state.transaction) {
      const t = state.transaction;
      setEditMode(true);
      setEditingId(t.id);
      setDate(t.date);
      if (t.partyId) setSelectedCustomer({ id: t.partyId, name: t.party });
      else setSelectedCustomer({ id: 'walk-in', name: t.party });

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
    }
  }, [state]);

  // 3. Fetch Initial Data (Products)
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data } = await api.get('/trading/products');
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setAllProducts(sorted);
        setSearchProducts(sorted);
      } catch (err) { console.error(err); }
    };
    fetchResources();
  }, []);

  // 4. Customer Search Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/parties?search=${custSearch}`);
        setCustomerList(data);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [custSearch]);

  // 5. Calculation Engine (The Brain from Code A)
  useEffect(() => {
    if (!isSale) {
      const sub = products.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.qty || 0)), 0);
      setTotals({ sub, disc: 0, total: sub });
      return;
    }

    // Skip calculation if user is still typing a product name (name exists but productId is null)
    // BUT: exclude free items from this check, as they may not have productIds yet
    const hasIncompleteName = products.some(p => p.name && !p.productId && p.name.trim() !== '' && !p.isFree);
    if (hasIncompleteName) return;

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
          excludedOffers: removedOfferIds
        };

        const { data } = await api.post('/smart-ops/calculate', payload);

        // Preserve focus state by checking if length changed or we need to merge
        setTotals(data.totals);
        setAppliedOffers(data.appliedOffers);
        setAvailableOffers(data.availableOffers);
        // Ensure auto-added free items carry a productId when we can match by name
        const normalizedProducts = (data.products || []).map(p => {
          if (p && p.isFree && !p.productId && p.name) {
            const match = allProducts.find(ap => ap.name && ap.name.trim().toLowerCase() === p.name.trim().toLowerCase());
            if (match) return { ...p, productId: match.id };
          }
          return p;
        });
        // We set products to get the updated amounts and free items from backend
        setProducts(normalizedProducts);
      } catch (err) { console.error("Calc error", err); }
    };

    const timer = setTimeout(() => { calculateTransaction(); }, 300);
    return () => clearTimeout(timer);
  }, [products.map(p => p.productId + p.qty + p.price).join(','), selectedCustomer?.id, date, isSale, removedOfferIds]);

  // 6. Click Outside Handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (custInputRef.current && !custInputRef.current.contains(event.target)) setIsCustDropdownOpen(false);
      if (!event.target.closest('.product-row')) setFocusedRowId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  /* ---------- HANDLERS ---------- */

  const handleAddProduct = () => {
    const lastProduct = products[products.length - 1];
    if (lastProduct && lastProduct.name === '' && !lastProduct.isFree) {
      // Focus existing empty row
      setFocusedRowId(lastProduct.id);
      return;
    }
    const newId = Date.now();
    setProducts(prev => [...prev, { id: newId, name: '', qty: 1, price: '', amount: 0, isFree: false, manual: false }]);
    // Use timeout to allow render before focusing
    setTimeout(() => setFocusedRowId(newId), 50);
  };

  const handleRemoveProduct = (id, isOfferRemoval = false) => {
    if (isOfferRemoval) {
      const product = products.find(i => i.id === id);
      if (product && product.offerId) setRemovedOfferIds(prev => [...prev, product.offerId]);
      setProducts(prev => prev.filter(i => i.id !== id));
    } else {
      if (products.length === 1) {
        setProducts([{ id: Date.now(), name: '', qty: 1, price: '', amount: 0, isFree: false }]);
      } else {
        setProducts(prev => prev.filter(i => i.id !== id));
      }
    }
  };

  const handleUpdateProduct = (id, field, value) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        if (field === 'qty' && value < 1) return p;
        if (field === 'price' && value < 0) return p;
        const updated = { ...p, [field]: value };
        if (p.isFree) updated.manual = true;
        updated.amount = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
        return updated;
      }
      return p;
    }));

    if (field === 'name') {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, productId: null, name: value } : p));
      setFocusedRowId(id);
      const filtered = value ? allProducts.filter(p => p.name.toLowerCase().includes(value.toLowerCase())) : allProducts;
      setSearchProducts(filtered);
    }
  };

  const handleProductSelect = (rowId, product) => {
    if (!rowId) return;
    // Fetch recommended price from backend (fast, lightweight per-product call)
    (async () => {
      try {
        const { data } = await api.get(`/trading/products/${product.id}/transactions`);
        const rec = data?.recommendedPrice ?? product.price;
        setProducts(prev => prev.map(item => {
          if (item.id === rowId) {
            return {
              ...item,
              productId: product.id,
              name: product.name,
              price: rec,
              amount: (Number(item.qty) || 1) * (Number(rec) || 0)
            };
          }
          return item;
        }));
      } catch (err) {
        // fallback to product.price
        setProducts(prev => prev.map(item => item.id === rowId ? { ...item, productId: product.id, name: product.name, price: product.price, amount: (Number(item.qty) || 1) * (Number(product.price) || 0) } : item));
      } finally {
        setFocusedRowId(null); // Close the master list highlight
        setSearchProducts(allProducts); // Reset list
      }
    })();
  };

  const handleViewProductHistory = async (product) => {
    if (!product || !product.id) {
      showNotify('error', 'Cannot load history for this product');
      return;
    }
    try {
      setHistoryLoading(true);
      const { data } = await api.get(`/trading/products/${product.id}/transactions`);
      setSelectedProductForHistory(product);
      setProductHistorySales(data.sales || []);
      setProductHistoryPurchases(data.purchases || []);
      setShowProductHistory(true);
    } catch (err) {
      console.error('Error fetching product history:', err);
      showNotify('error', 'Failed to load product history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    // 1. Validation Logic from Code A
    if (!selectedCustomer) { showNotify('error', "Please select a party."); return; }
    const filledProducts = products.filter(p => p.name && p.name.trim() !== '');
    if (filledProducts.length === 0) { showNotify('error', "Please add at least one product."); return; }

    for (const p of filledProducts) {
      if (!p.productId && !p.isFree) { showNotify('error', `Product '${p.name}' not found in list.`); return; }
      if (!p.qty || Number(p.qty) <= 0) { showNotify('error', `Invalid quantity for '${p.name}'.`); return; }
      if (!p.isFree && (!p.price || Number(p.price) < 0)) { showNotify('error', `Price missing for '${p.name}'.`); return; }
    }

    try {
      const payload = {
        partyId: (selectedCustomer?.id && selectedCustomer.id !== 'walk-in') ? selectedCustomer.id : null,
        partyName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        date,
        type: isSale ? 'SALE' : 'PURCHASE',
        products: filledProducts.map(p => ({
          productId: p.productId,
          qty: p.qty,
          price: p.price,
          amount: p.amount,
          isFree: p.isFree
        })),
        subTotal: totals.sub,
        discount: totals.disc,
        totalAmount: totals.total,
        paidAmount: Number(paidAmount) || 0
      };

      if (editMode) {
        await api.put(`/trading/transactions/${editingId}`, payload);
        showNotify('success', `Transaction Updated!`);
      } else {
        await api.post('/trading/transactions', payload);
        showNotify('success', `Transaction Saved!`);
      }
      setTimeout(() => navigate('/transactions'), 1000);
    } catch (err) {
      console.error(err);
      showNotify('error', err.response?.data?.error || 'Failed to save');
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">

      {/* --- MODALS & TOASTS --- */}
      <ProductHistoryModal
        isOpen={showProductHistory}
        onClose={() => setShowProductHistory(false)}
        product={selectedProductForHistory}
        sales={productHistorySales}
        purchases={productHistoryPurchases}
        loading={historyLoading}
      />
      <WalkInModal isOpen={showWalkInModal} onClose={() => setShowWalkInModal(false)} onSave={(d) => { setWalkInDetails(d); setShowWalkInModal(false); }} />
      {notification.message && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-lg border shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
          {notification.type === 'error' ? <X size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-30">

        {/* Left: Mode Switcher & Date */}
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
            <button onClick={() => navigate('/new-sale')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isSale ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Sale</button>
            <button onClick={() => navigate('/new-purchase')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isSale ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Purchase</button>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-2"></div>

          {/* Party Search */}
          <div ref={custInputRef} className="relative w-72 group">
            <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              value={custSearch}
              onChange={e => { setCustSearch(e.target.value); setIsCustDropdownOpen(true); }}
              onFocus={() => setIsCustDropdownOpen(true)}
              placeholder={selectedCustomer ? selectedCustomer.name : 'Search Party / Customer...'}
              className={`w-full pl-9 pr-8 py-2 bg-gray-50 border border-transparent focus:bg-white rounded-lg text-sm outline-none transition-all ${theme.borderFocus} focus:ring-2 focus:ring-opacity-20 focus:ring-current placeholder-gray-400 font-medium text-gray-700`}
            />
            {selectedCustomer && <button onClick={() => { setSelectedCustomer(null); setCustSearch(''); }} className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"><X size={16} /></button>}

            {/* Dropdown */}
            {isCustDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div onMouseDown={() => { setSelectedCustomer({ id: 'walk-in', name: 'Walk-in Customer' }); setShowWalkInModal(true); setIsCustDropdownOpen(false); }} className="p-3 hover:bg-green-50 text-green-700 cursor-pointer border-b border-gray-50 flex items-center gap-2 font-medium">
                  <Plus size={16} /> Walk-in Customer
                </div>
                {customerList.length > 0 ? customerList.map(c => (
                  <div key={c.id} onMouseDown={() => { setSelectedCustomer(c); setIsCustDropdownOpen(false); setCustSearch(''); }} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                    <div className="text-sm font-bold text-gray-700">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.phone}</div>
                  </div>
                )) : <div className="p-4 text-center text-xs text-gray-400">No customers found</div>}
              </div>
            )}
          </div>

          <div className="relative">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="pl-9 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 cursor-pointer" />
            <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/transactions')} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="History"><History size={20} /></button>
          <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 font-medium ${theme.primary} ${theme.primaryHover}`}>
            <Save size={18} /> {editMode ? 'Update' : 'Save Bill'}
          </button>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="flex-1 grid grid-cols-10 gap-4 p-4 overflow-hidden">

        {/* LEFT PANEL: PRODUCT TABLE (Span 7) */}
        <div className="col-span-7 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-5">Product Name</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {products.map((p, idx) => (
              <div key={p.id} className={`product-row grid grid-cols-12 gap-3 items-center px-2 py-1.5 rounded-lg transition-colors border border-transparent ${p.isFree ? 'bg-amber-50 border-amber-200' : 'hover:bg-gray-50'}`}>
                <div className="col-span-5 relative">
                  <input
                    className={`w-full bg-transparent p-2 text-sm font-medium outline-none rounded-md focus:bg-white focus:shadow-sm ${p.isFree ? 'text-amber-800 placeholder-amber-400' : 'text-gray-800'}`}
                    placeholder="Start typing..."
                    value={p.name}
                    onChange={e => handleUpdateProduct(p.id, 'name', e.target.value)}
                    onFocus={() => setFocusedRowId(p.id)}
                    disabled={p.isFree}
                    autoFocus={idx === products.length - 1 && !p.name} // Auto focus new row
                  />
                  {p.isFree && <span className="absolute right-0 top-2.5 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1"><Gift size={10} /> FREE</span>}
                </div>
                <div className="col-span-2">
                  <input type="number" className="w-full text-right bg-transparent p-2 text-sm outline-none border-b border-transparent focus:border-gray-300 focus:bg-white rounded" value={p.qty} onChange={e => handleUpdateProduct(p.id, 'qty', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <input type="number" min="0" className="w-full text-right bg-transparent p-2 text-sm outline-none border-b border-transparent focus:border-gray-300 focus:bg-white rounded" value={p.price} onChange={e => handleUpdateProduct(p.id, 'price', e.target.value)} disabled={p.isFree} />
                </div>
                <div className="col-span-2 text-right font-bold text-gray-700 text-sm">
                  ₹{(p.amount || 0).toLocaleString()}
                </div>
                <div className="col-span-1 flex justify-center gap-1">
                  {p.productId && (
                    <button onClick={() => {
                      const prod = allProducts.find(ap => ap.id === p.productId);
                      if (prod) handleViewProductHistory(prod);
                    }} className="text-gray-300 hover:text-blue-500 transition-colors p-1.5 hover:bg-blue-50 rounded-md" title="View History">
                      <History size={16} />
                    </button>
                  )}
                  <button onClick={() => handleRemoveProduct(p.id, !!p.offerId)} className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-md">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <div className="p-2 border-t border-gray-100 bg-gray-50/30">
            <button onClick={handleAddProduct} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors ${theme.text} hover:bg-gray-50`}>
              <Plus size={16} /> Add Product Row
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: MASTER LIST & OFFERS (Span 3) */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">

          {/* 1. Product Master List (Dynamic based on focus) */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden min-h-0">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">
                {focusedRowId ? 'Select Product' : 'Product Master'}
              </span>
              <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{searchProducts.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {searchProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <Search size={24} className="opacity-20" />
                  <p className="text-xs">No products found</p>
                </div>
              ) : (
                searchProducts.map(p => (
                  <div key={p.id} onMouseDown={() => handleProductSelect(focusedRowId, p)} className="group px-3 py-2.5 mb-1 rounded-xl text-sm hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-all border border-transparent hover:border-blue-100">
                    <span className="text-gray-700 font-medium group-hover:text-blue-700">{p.name}</span>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 bg-gray-50 group-hover:bg-white px-2 py-1 rounded-md">₹{p.price}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Offers Panel */}
          {isSale && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col max-h-[40%]">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setShowOffers(!showOffers)}>
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="text-purple-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase">Offers & Deals</span>
                </div>
                <span className="text-xs text-blue-600 font-medium">{showOffers ? 'Hide' : 'Show'}</span>
              </div>

              {showOffers && (
                <div className="overflow-y-auto p-3 space-y-3">
                  {/* Applied */}
                  {appliedOffers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Applied</p>
                      {appliedOffers.map(o => (
                        <div key={o.id} className="bg-green-50 border border-green-100 p-2 rounded-lg flex justify-between items-start">
                          <div className="flex gap-2">
                            <CheckCircle2 size={14} className="text-green-600 mt-0.5" />
                            <span className="text-xs text-green-800 font-medium leading-tight">{o.desc}</span>
                          </div>
                          <button onClick={() => setRemovedOfferIds(prev => [...prev, o.id])} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Available */}
                  {availableOffers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Available</p>
                      {availableOffers.map(o => (
                        <div key={o.id} className="bg-gray-50 border border-dashed border-gray-300 p-2 rounded-lg flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                          <span className="text-xs text-gray-600">{o.desc}</span>
                          {removedOfferIds.includes(o.id) && <button onClick={() => setRemovedOfferIds(prev => prev.filter(id => id !== o.id))} className="text-[10px] underline text-blue-600 font-bold">Apply</button>}
                        </div>
                      ))}
                    </div>
                  )}
                  {appliedOffers.length === 0 && availableOffers.length === 0 && (
                    <div className="text-center py-4 text-xs text-gray-400">No active offers</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="flex items-center gap-8">
          <div className="text-sm">
            <span className="text-gray-400 block text-xs uppercase mb-0.5">Subtotal</span>
            <span className="font-bold text-gray-700">₹{totals.sub.toLocaleString()}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400 block text-xs uppercase mb-0.5">Discount</span>
            <span className="font-bold text-red-500">- ₹{totals.disc.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div>
            <span className="text-gray-400 block text-xs uppercase mb-0.5">Paid Amount</span>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-gray-400 text-xs">₹</span>
              <input
                type="number"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                className="w-32 pl-5 pr-2 py-1 bg-gray-100 border-none rounded text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-gray-400 block text-xs uppercase mb-0.5">Grand Total</span>
            <span className="text-2xl font-black text-gray-800">₹{totals.total.toLocaleString()}</span>
          </div>

          <div className={`px-4 py-2 rounded-xl text-right ${totals.total - paidAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <span className="block text-[10px] font-bold uppercase opacity-70">Balance Due</span>
            <span className="text-lg font-bold">₹{Math.round(totals.total - (Number(paidAmount) || 0)).toLocaleString()}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NewTransaction;
