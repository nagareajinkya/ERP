import React, { useState } from 'react';
import { 
  Search, Plus, Package, AlertTriangle, 
  TrendingUp, Edit2, X, Tag, Filter 
} from 'lucide-react';

const Inventory = () => {
  // --- 1. MOCK DATA ---
  const [products, setProducts] = useState([
    { 
      id: 1, name: "Premium Basmati Rice", category: "Groceries", unit: "kg", 
      stock: 45, minStock: 20, buyPrice: 120, sellPrice: 150, 
      gstRate: 5, hsn: "1006", sku: "RICE-001" 
    },
    { 
      id: 2, name: "Fortune Sunflower Oil", category: "Groceries", unit: "ltr", 
      stock: 8, minStock: 15, buyPrice: 110, sellPrice: 135, 
      gstRate: 12, hsn: "1512", sku: "OIL-001" 
    },
    { 
      id: 3, name: "Tata Salt", category: "Groceries", unit: "kg", 
      stock: 120, minStock: 30, buyPrice: 20, sellPrice: 28, 
      gstRate: 0, hsn: "2501", sku: "SALT-001" 
    },
    { 
      id: 4, name: "Britannia Bread", category: "Bakery", unit: "pkt", 
      stock: 12, minStock: 25, buyPrice: 35, sellPrice: 45, 
      gstRate: 0, hsn: "1905", sku: "BRD-001" 
    },
  ]);

  // --- 2. STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Form State
  const initialFormState = {
    id: null, name: '', category: '', unit: 'Pcs', sku: '', 
    stock: '', minStock: '', buyPrice: '', sellPrice: '',
    gstRate: 0, hsn: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // --- 3. DYNAMIC CATEGORIES ---
  const availableCategories = ['All', ...new Set(products.map(p => p.category))];

  // --- 4. HELPER FUNCTIONS ---
  const totalValue = products.reduce((sum, item) => sum + (item.stock * item.buyPrice), 0);
  const lowStockItems = products.filter(item => item.stock < item.minStock).length;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing) {
      setProducts(products.map(p => p.id === formData.id ? formData : p));
    } else {
      setProducts([...products, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-semibold text-gray-800">Inventory</h1>
           <p className="text-sm text-gray-500 mt-1">Manage stock, pricing & taxation</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-200"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><Package size={24} /></div>
          <div><p className="text-xs font-medium text-gray-400 uppercase">Total Items</p><p className="text-2xl font-bold text-gray-800">{products.length}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-xl text-red-500"><AlertTriangle size={24} /></div>
          <div><p className="text-xs font-medium text-gray-400 uppercase">Low Stock</p><p className="text-2xl font-bold text-red-600">{lowStockItems}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><TrendingUp size={24} /></div>
          <div><p className="text-xs font-medium text-gray-400 uppercase">Total Stock Value</p><p className="text-2xl font-bold text-gray-800">₹{totalValue.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Search & Dynamic Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Search by name, SKU or HSN..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-100 outline-none"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none appearance-none cursor-pointer"
          >
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const isLowStock = product.stock <= product.minStock;
          return (
            <div key={product.id} className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-md group relative ${isLowStock ? 'border-red-200 shadow-red-50' : 'border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{product.sku}</span>
                    <span className="text-xs font-medium bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{product.category}</span>
                  </div>
                </div>
                <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50/50 p-3 rounded-xl">
                 <div><p className="text-[10px] text-gray-400 uppercase font-medium">Stock Level</p><p className={`text-lg font-bold ${isLowStock ? 'text-red-500' : 'text-gray-800'}`}>{product.stock} <span className="text-xs font-normal text-gray-500">{product.unit}</span></p></div>
                 <div className="text-right"><p className="text-[10px] text-gray-400 uppercase font-medium">Sale Price</p><p className="text-lg font-bold text-gray-800">₹{product.sellPrice}</p></div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500"><Tag size={14} className="text-gray-400" /><span>GST: {product.gstRate}%</span></div>
                {isLowStock && (<div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full"><AlertTriangle size={12} /> Low Stock</div>)}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          
          {/* MODAL CONTAINER 
             - overflow-hidden: Clips the content to the rounded corners
             - flex-col: Stacks Header and Body
          */}
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* 1. Header (Static) */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
              <div><h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h2><p className="text-xs text-gray-400 mt-0.5">Enter product details and taxation info</p></div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
            </div>

            {/* 2. Scrollable Body
               - mr-1: Right margin moves scrollbar away from the right edge
               - mb-2: Bottom margin moves scrollbar away from the rounded bottom corner
               - p-6: Inner padding for content
            */}
            <div className="overflow-y-auto scrollbar-hover flex-1 p-6 mr-1 mb-2">
              <form onSubmit={handleSave} className="space-y-8">
                
                {/* 1. Basic Info */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="e.g. Premium Basmati Rice" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU / Code</label>
                      <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="RICE-001" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <input list="category-options" type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="Select or Type" />
                      <datalist id="category-options">
                          {availableCategories.filter(c => c !== 'All').map(cat => (<option key={cat} value={cat} />))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
                      <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200">
                        <option value="Pcs">Pieces (Pcs)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="ltr">Litre (ltr)</option>
                        <option value="box">Box</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Stock */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Stock & Pricing</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Current Stock</label><input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Min Stock Alert</label><input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Price</label><input type="number" value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Sale Price</label><input type="number" required value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" /></div>
                  </div>
                </div>

                {/* 3. Taxation */}
                <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                  <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag size={14} /> GST Details (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Rate (%)</label>
                      <select value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: Number(e.target.value)})} className="w-full p-3 bg-white border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300">
                        <option value="0">Exempt (0%)</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">HSN / SAC Code</label>
                      <input type="text" placeholder="e.g. 1006" value={formData.hsn} onChange={e => setFormData({...formData, hsn: e.target.value})} className="w-full p-3 bg-white border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all">{isEditing ? 'Save Changes' : 'Add Product'}</button>
                </div>

              </form>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;