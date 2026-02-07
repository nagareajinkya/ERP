import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, Package, AlertTriangle, Edit2, Trash2, X,
  CheckCircle2, Filter, Tag, ChevronDown, UploadCloud,
  RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import { GST_PRESETS, ADJUSTMENT_REASONS } from './../../src/data/inventoryData';
import api from '../../src/api';
import { toast } from 'react-toastify';
import SearchBar from '../../components/common/SearchBar';
import FilterSelect from '../../components/common/FilterSelect';
import StatCard from '../../components/common/StatCard';
import FormLabel from '../../components/common/FormLabel';
// IMPORT REUSABLE COMPONENT
import AddPropertyModal from '../../components/common/AddPropertyModal';

const Inventory = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);

  // These now hold objects {id, name}
  const [categoriesList, setCategoriesList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);

  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Nested Modal States (REPLACED by unified state)
  // const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  // const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  // const [newCatName, setNewCatName] = useState('');
  // const [newUnitName, setNewUnitName] = useState('');

  // Unified Add Prop Modal State
  const [addPropType, setAddPropType] = useState(null); // 'category' or 'unit' or null
  const [addPropInitialName, setAddPropInitialName] = useState('');


  // Dropdown States
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const catRef = useRef(null);
  const unitRef = useRef(null);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const initialFormState = { id: '', sku: '', name: '', category: '', qty: '', unit: '', buyPrice: '', sellPrice: '', mrp: '', minStock: '', gstRate: 0, hsn: '' };
  const [formData, setFormData] = useState(initialFormState);

  // Adjust Stock Form State
  const [adjustData, setAdjustData] = useState({ qty: '', reason: 'Loss', note: '' });

  // Errors
  const [formErrors, setFormErrors] = useState({});

  // --- FETCH DATA FROM API ---
  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const fetchMetadata = async () => {
    try {
      const [catRes, unitRes] = await Promise.all([
        api.get('/trading/categories'), // Gateway routes
        api.get('/trading/units')
      ]);
      setCategoriesList(catRes.data || []);
      setUnitsList(unitRes.data || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products first (Client-side filtering for now as per plan)
      const { data } = await api.get('/trading/products');

      // Map Backend DTO to Frontend Structure
      const mappedProducts = (data || []).map(p => ({
        ...p,
        category: p.categoryName || '', // Map name for UI
        unit: p.unitName || '',         // Map name for UI
        qty: p.currentStock || 0
      }));

      // Client-side filtering
      let filtered = mappedProducts;
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.hsn?.includes(q)
        );
      }

      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT: Click Outside to Close Dropdowns ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (catRef.current && !catRef.current.contains(event.target)) setIsCatDropdownOpen(false);
      if (unitRef.current && !unitRef.current.contains(event.target)) setIsUnitDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- INVENTORY STATISTICS ---
  // Calculated client-side from the current list for mostly accurate instant feedback
  const totalItems = products.length;
  const lowStockCount = products.filter(p => p.qty <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.qty === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.qty * p.buyPrice), 0);

  // --- FILTERS FOR UI ---
  // Create simple arrays of names for filtering logic
  const categoryNames = categoriesList.map(c => c.name).sort();
  const unitNames = unitsList.map(u => u.name).sort();

  // Filter dropdown lists based on input
  const filteredCategoryOptions = categoryNames.filter(c => c.toLowerCase().includes((formData.category || '').toLowerCase()));
  const filteredUnitOptions = unitNames.filter(u => u.toLowerCase().includes((formData.unit || '').toLowerCase()));

  // --- HANDLERS ---

  const resetDropdowns = () => {
    setIsCatDropdownOpen(false);
    setIsUnitDropdownOpen(false);
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setFormErrors({});
    resetDropdowns();
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData(product);
    setIsEditing(true);
    setFormErrors({});
    resetDropdowns();
    setIsModalOpen(true);
  };

  const handleFieldChange = (field, value) => {
    if (formErrors[field]) setFormErrors({ ...formErrors, [field]: null });
    // Prevent negative numbers
    if (['qty', 'minStock', 'buyPrice', 'sellPrice', 'gstRate', 'mrp'].includes(field)) {
      if (Number(value) < 0) return;
    }
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required.";
    // Check if entered category/unit exists in our named lists
    if (!categoryNames.includes(formData.category)) errors.category = "Select valid category.";
    if (!unitNames.includes(formData.unit)) errors.unit = "Select valid unit.";

    // Backend requires Buy Price
    if (formData.buyPrice === '' || Number(formData.buyPrice) < 0) errors.buyPrice = "Buy Price is required.";

    if (formData.qty < 0) errors.qty = "Cannot be negative.";
    if (formData.minStock < 0) errors.minStock = "Cannot be negative.";
    if (!isEditing && formData.buyPrice < 0) errors.buyPrice = "Cannot be negative."; // Redundant but safe logic

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Look up IDs
    const catObj = categoriesList.find(c => c.name === formData.category);
    const unitObj = unitsList.find(u => u.name === formData.unit);

    if (!catObj || !unitObj) {
      toast.error("Invalid Category or Unit");
      return;
    }

    const payload = {
      ...formData,
      categoryId: catObj.id,
      unitId: unitObj.id,
      currentStock: formData.qty // Map qty back to backend field
    };

    try {
      if (isEditing) {
        await api.put(`/trading/products/${formData.id}`, payload);
      } else {
        await api.post('/trading/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/trading/products/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Replaced manual add handlers with onSuccess callback from modal
  const handlePropertyAdded = async (newName) => {
    // Refresh list
    await fetchMetadata();

    // Auto-select the newly added item in the form
    if (addPropType === 'category') {
      handleFieldChange('category', newName);
      setIsCatDropdownOpen(false);
    } else if (addPropType === 'unit') {
      handleFieldChange('unit', newName);
      setIsUnitDropdownOpen(false);
    }

    setAddPropType(null);
  };


  const openAdjustModal = () => {
    setAdjustData({ qty: '', reason: 'Loss', note: '' });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const reduceQty = Number(adjustData.qty);
    if (reduceQty <= 0) return;
    if (reduceQty > formData.qty) {
      toast.error("Cannot remove more items than current stock");
      return;
    }

    // Logic: We are just updating the product with new stock for MVP.
    // Ideally we would have a specific stock adjustment endpoint or transaction log.
    const newQty = formData.qty - reduceQty;

    // We need IDs again for the full update payload
    // Note: This relies on the open modal having the correct names populated
    const catObj = categoriesList.find(c => c.name === formData.category);
    const unitObj = unitsList.find(u => u.name === formData.unit);

    if (!catObj || !unitObj) return;

    const payload = {
      ...formData,
      categoryId: catObj.id,
      unitId: unitObj.id,
      currentStock: newQty
    };

    try {
      await api.put(`/trading/products/${formData.id}`, payload);

      // Update local state without full refetch for speed, or refetch to be safe
      fetchProducts();
      setFormData({ ...formData, qty: newQty }); // Update open form
      setIsAdjustModalOpen(false);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Failed to adjust stock");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-sm text-gray-500 font-medium">Manage stock, pricing, and GST details.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm">
            <UploadCloud size={18} /> Import CSV
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Items" value={totalItems} icon={Package} iconColor="bg-blue-50 text-blue-600" borderColor="border-gray-100" />
        <StatCard label="Low Stock" value={lowStockCount} icon={AlertTriangle} iconColor="bg-red-50 text-red-600" borderColor="border-gray-100" valueColor="text-red-600" />
        <StatCard label="Out of Stock" value={outOfStockCount} icon={X} iconColor="bg-gray-100 text-gray-600" borderColor="border-gray-100" />
        <StatCard label="Stock Value" value={`₹${totalValue.toLocaleString()}`} icon={CheckCircle2} iconColor="bg-green-50 text-green-600" borderColor="border-gray-100" />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-4">
          <SearchBar placeholder="Search by name, SKU, or HSN..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-96" />
          <FilterSelect placeholder="All Categories" options={['All', ...categoryNames]} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-64" />
        </div>

        {/* Product Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 sticky top-0 z-10">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Product Info</th>
                <th className="py-4 px-6">Tax / HSN</th>
                <th className="py-4 px-6 text-right">Purchase Price</th>
                <th className="py-4 px-6 text-right">Selling Price</th>
                <th className="py-4 px-6 text-right">In Stock</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6"><p className="font-bold text-gray-800 mb-0.5">{product.name}</p><div className="flex items-center gap-2"><span className="text-xs font-bold text-gray-400">{product.sku}</span><span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{product.category}</span></div></td>
                  <td className="py-4 px-6"><p className="font-bold text-gray-700">GST {product.gstRate}%</p><p className="text-xs text-gray-400">HSN: {product.hsn}</p></td>
                  <td className="py-4 px-6 text-right text-gray-500 font-medium">₹{product.buyPrice}</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-800">₹{product.sellPrice || '-'}</td>
                  <td className="py-4 px-6 text-right"><p className={`font-bold text-base ${product.qty <= product.minStock ? 'text-red-600' : 'text-gray-700'}`}>{product.qty} <span className="text-xs text-gray-400">{product.unit}</span></p>{product.qty <= product.minStock && <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-bold uppercase">Low Stock</span>}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => openEditModal(product)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteConfirmId(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 1. MAIN ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div><h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h2><p className="text-xs text-gray-400 mt-0.5">Fields marked with <span className="text-red-500">*</span> are compulsory</p></div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors bg-white shadow-sm"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6 scrollbar-hover">
              <form onSubmit={handleSaveProduct} className="space-y-8">

                {/* Basic Info */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-3">
                      <FormLabel text="Product Name" required={true} className="block text-sm font-bold text-gray-600 mb-1.5" />
                      <input type="text" placeholder="e.g. Parle-G" value={formData.name} onChange={e => handleFieldChange('name', e.target.value)} className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:bg-white focus:ring-4 transition-all font-bold ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-50' : 'border-transparent focus:border-green-500 focus:ring-green-50'}`} />
                      {formErrors.name && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.name}</p>}
                    </div>
                    <div><FormLabel text="SKU / Code" className="block text-sm font-bold text-gray-600 mb-1.5" /><input type="text" placeholder="e.g. PAR-01" value={formData.sku} onChange={e => handleFieldChange('sku', e.target.value)} className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none font-bold" /></div>

                    {/* CUSTOM CATEGORY DROPDOWN */}
                    <div ref={catRef} className="relative">
                      <FormLabel text="Category" required={true} className="block text-sm font-bold text-gray-600 mb-1.5" />
                      <input type="text" value={formData.category} onFocus={() => setIsCatDropdownOpen(true)} onChange={e => { handleFieldChange('category', e.target.value); setIsCatDropdownOpen(true); }} placeholder="Type to search..." className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:bg-white focus:ring-4 transition-all font-bold ${formErrors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-50' : 'border-transparent focus:border-green-500 focus:ring-green-50'}`} />
                      <ChevronDown className="absolute right-3 top-11 text-gray-400 pointer-events-none" size={16} />
                      {formErrors.category && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.category}</p>}
                      {isCatDropdownOpen && (
                        <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-auto py-1">
                          {filteredCategoryOptions.length > 0 ? filteredCategoryOptions.map(c => (
                            <button key={c} type="button" onClick={() => { handleFieldChange('category', c); setIsCatDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">{c}</button>
                          )) : (
                            <div className="px-4 py-2 text-xs text-gray-400 italic">No exact match found.</div>
                          )}
                          <div className="border-t border-gray-50 mt-1 p-1">
                            {/* UPDATED: Open shared modal */}
                            <button type="button" onClick={() => { setAddPropInitialName(formData.category); setAddPropType('category'); }} className="w-full flex items-center justify-center gap-1 py-2 text-sm font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><Plus size={14} /> Add New Category</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CUSTOM UNIT DROPDOWN */}
                    <div ref={unitRef} className="relative">
                      <FormLabel text="Unit" required={true} className="block text-sm font-bold text-gray-600 mb-1.5" />
                      <input type="text" value={formData.unit} onFocus={() => setIsUnitDropdownOpen(true)} onChange={e => { handleFieldChange('unit', e.target.value); setIsUnitDropdownOpen(true); }} placeholder="e.g. kg, pc" className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:bg-white focus:ring-4 transition-all font-bold ${formErrors.unit ? 'border-red-500 focus:border-red-500 focus:ring-red-50' : 'border-transparent focus:border-green-500 focus:ring-green-50'}`} />
                      <ChevronDown className="absolute right-3 top-11 text-gray-400 pointer-events-none" size={16} />
                      {formErrors.unit && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.unit}</p>}
                      {isUnitDropdownOpen && (
                        <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-auto py-1">
                          {filteredUnitOptions.length > 0 ? filteredUnitOptions.map(u => (
                            <button key={u} type="button" onClick={() => { handleFieldChange('unit', u); setIsUnitDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">{u}</button>
                          )) : null}
                          <div className="border-t border-gray-50 mt-1 p-1">
                            {/* UPDATED: Open shared modal */}
                            <button type="button" onClick={() => { setAddPropInitialName(formData.unit); setAddPropType('unit'); }} className="w-full flex items-center justify-center gap-1 py-2 text-sm font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><Plus size={14} /> Add New Unit</button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Stock & Pricing */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Stock & Pricing</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    {/* CURRENT STOCK */}
                    <div>
                      <FormLabel text="Current Stock" required={true} className="block text-sm font-bold text-gray-600 mb-1.5" />
                      <div className="flex gap-2">
                        <input
                          type="number" min="0" step="any"
                          placeholder="e.g. 50"
                          disabled={isEditing}
                          value={formData.qty}
                          onChange={e => handleFieldChange('qty', e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none font-bold transition-all ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200' : 'bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50'}`}
                        />
                        {isEditing && (
                          <button type="button" onClick={openAdjustModal} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100" title="Adjust for damage/loss">
                            <RefreshCw size={18} />
                          </button>
                        )}
                      </div>
                      {isEditing && <p className="text-[10px] text-gray-400 mt-1 font-medium">Locked. Use 'New Purchase' or Adjust icon.</p>}
                    </div>

                    <div><FormLabel text="Min Stock" required={true} className="block text-sm font-bold text-gray-600 mb-1.5" /><input type="number" min="0" step="any" placeholder="e.g. 10" value={formData.minStock} onChange={e => handleFieldChange('minStock', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 font-bold" /></div>

                    {/* HIDE BUY PRICE ON EDIT */}
                    {!isEditing && (
                      <div><FormLabel text="Buy Price (₹)" required={true} className="block text-sm font-bold text-gray-600 mb-1.5" /><input type="number" min="0" step="any" placeholder="e.g. 45.50" value={formData.buyPrice} onChange={e => handleFieldChange('buyPrice', e.target.value)} className={`w-full p-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-4 transition-all font-bold ${formErrors.buyPrice ? 'border-red-500 focus:border-red-500 focus:ring-red-50' : 'border-transparent focus:border-green-500 focus:ring-green-50'}`} />
                        {formErrors.buyPrice && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.buyPrice}</p>}
                      </div>
                    )}

                    <div><FormLabel text="Sell Price (₹)" className="block text-sm font-bold text-gray-600 mb-1.5" /><input type="number" min="0" step="any" placeholder="Optional" value={formData.sellPrice} onChange={e => handleFieldChange('sellPrice', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 font-bold" /></div>

                    <div><FormLabel text="MRP (₹)" className="block text-sm font-bold text-gray-600 mb-1.5" /><input type="number" min="0" step="any" placeholder="Optional" value={formData.mrp} onChange={e => handleFieldChange('mrp', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 font-bold" /></div>
                  </div>
                </div>

                {/* Taxation */}
                <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                  <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Tag size={14} /> Tax Details (Included in Price)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <FormLabel text="GST Rate (%)" className="block text-sm font-bold text-gray-600 mb-1.5" />
                      <input type="number" min="0" placeholder="e.g. 18" value={formData.gstRate} onChange={e => handleFieldChange('gstRate', e.target.value)} className="w-full p-3 bg-white border border-green-100 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 font-bold mb-2" />
                      <div className="flex gap-1.5 flex-wrap">
                        {GST_PRESETS.map(rate => (
                          <button key={rate} type="button" onClick={() => handleFieldChange('gstRate', rate)} className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${Number(formData.gstRate) === rate ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{rate}%</button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <FormLabel text="HSN / SAC Code" className="block text-sm font-bold text-gray-600 mb-1.5" />
                      <input type="text" placeholder="e.g. 1006" value={formData.hsn} onChange={e => handleFieldChange('hsn', e.target.value)} className="w-full p-3 bg-white border border-green-100 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 font-bold" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all">{isEditing ? 'Save Changes' : 'Add Product'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. STOCK ADJUSTMENT MODAL --- */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-orange-500" /> Adjust Stock</h3>
            <p className="text-sm text-gray-500 mb-4">Remove items from stock due to loss or returns.</p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div><FormLabel text="Quantity to Remove" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5" /><input autoFocus type="number" min="1" max={formData.qty} required value={adjustData.qty} onChange={e => setAdjustData({ ...adjustData, qty: e.target.value })} className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none font-bold" placeholder="e.g. 2" /></div>
              <div><FormLabel text="Reason" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5" /><select value={adjustData.reason} onChange={e => setAdjustData({ ...adjustData, reason: e.target.value })} className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none font-bold">{ADJUSTMENT_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>

              {/* Dynamic Note for Users */}
              {adjustData.reason === 'Return' ? (
                <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg flex gap-2"><ArrowRight size={14} className="shrink-0 mt-0.5" /> <strong>Return:</strong> Stock reduced. Marked as 'Returned' (Not a loss).</p>
              ) : adjustData.reason === 'Internal' ? (
                <p className="text-xs text-gray-600 bg-gray-100 p-3 rounded-lg flex gap-2"><ArrowRight size={14} className="shrink-0 mt-0.5" /> <strong>Internal Use:</strong> Stock reduced. Recorded as business expense.</p>
              ) : (
                <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg flex gap-2"><ArrowRight size={14} className="shrink-0 mt-0.5" /> <strong>Loss/Expired:</strong> Stock reduced. Recorded as financial loss (SP = 0).</p>
              )}

              <div className="flex gap-3 mt-2"><button type="button" onClick={() => setIsAdjustModalOpen(false)} className="flex-1 py-2.5 font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">Cancel</button><button type="submit" className="flex-1 py-2.5 font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all">Confirm</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- 3. REUSABLE ADD PROPERTY MODAL (Replaces inline modals) --- */}
      <AddPropertyModal
        isOpen={addPropType !== null}
        onClose={() => setAddPropType(null)}
        type={addPropType || 'category'}
        initialName={addPropInitialName}
        onSuccess={handlePropertyAdded}
      />

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3"><button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">Cancel</button><button onClick={handleDeleteProduct} className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all">Delete</button></div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
