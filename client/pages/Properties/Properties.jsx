import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Check, X,
  Package, ShoppingBag, Star, Coffee, Zap, Heart, Box, Tag, Sun, Smile,
  Ruler
} from 'lucide-react';
import TabsBar from '../../components/common/TabsBar';
import SearchBar from '../../components/common/SearchBar';
import { CATEGORY_STYLES } from '../../src/data/propertiesData';
import api from '../../src/api';
import { toast } from 'react-toastify';
// Import the new reusable modal
import AddPropertyModal from '../../components/common/AddPropertyModal';

// Icon Map (Ideally should be shared or imported if used in Modal too, but keeping local for rendering grid)
const ICON_MAP = {
  'package': Package,
  'shopping-bag': ShoppingBag,
  'star': Star,
  'coffee': Coffee,
  'zap': Zap,
  'heart': Heart,
  'box': Box,
  'tag': Tag,
  'sun': Sun,
  'smile': Smile,
};

const Properties = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]); // For counts

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);

  // Edit Mode
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editShort, setEditShort] = useState('');

  // --- FETCH DATA ---
  useEffect(() => {
    fetchMetadata();
    fetchProducts();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catRes, unitRes] = await Promise.all([
        api.get('/trading/categories'),
        api.get('/trading/units')
      ]);
      setCategories(catRes.data || []);
      setUnits(unitRes.data || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/trading/products');
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // --- HELPERS ---

  // Get product count for a category (Frontend ID vs Backend ID matching)
  const getProductCount = (catId) => {
    return products.filter(p => p.categoryId === catId).length;
  };

  // Get products for the "View" modal
  const getCategoryProducts = () => {
    if (!viewCategory) return [];
    return products.filter(p => p.categoryId === viewCategory.id);
  };

  // Filtering for Search
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUnits = units.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- ACTIONS ---

  // NOTE: handleAddItem is removed because it's now handled by AddPropertyModal

  const startEdit = (item, type) => {
    setEditingId(item.id);
    setEditValue(item.name);
    if (type === 'unit') setEditShort(item.symbol || '');
  };

  const saveEdit = async (type) => {
    try {
      toast.info("Edit feature coming soon (Backend Update Endpoint Required)");
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories & Units</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories and measurement units</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all"
        >
          <Plus size={18} />
          {activeTab === 'categories' ? 'Add Category' : 'Add Unit'}
        </button>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <TabsBar tabs={['categories', 'units']} activeTab={activeTab} onTabChange={setActiveTab} variant="light" className="flex bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto" />

        <SearchBar placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-80 mr-2" variant="light" />
      </div>

      {/* --- CATEGORIES GRID --- */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => {
            const sId = cat.styleId !== undefined ? cat.styleId : 0;
            const style = CATEGORY_STYLES[sId] || CATEGORY_STYLES[0];
            const Icon = style.icon ? ICON_MAP[style.icon] || Package : Package;

            return (
              <div
                key={cat.id}
                onClick={() => !editingId && setViewCategory(cat)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group relative cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.bg} ${style.text}`}>
                    <Icon size={24} />
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {editingId === cat.id ? (
                      <>
                        <button onClick={() => saveEdit('category')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(cat, 'category')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full p-2 bg-gray-50 border border-blue-200 rounded-lg text-sm font-semibold outline-none"
                    />
                  ) : (
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                  )}
                  <p className="text-sm text-gray-400 mt-1">{getProductCount(cat.id)} products</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- UNITS GRID --- */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUnits.map((unit) => (
            <div key={unit.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {editingId === unit.id ? <Ruler size={16} /> : (unit.symbol || unit.name.substring(0, 2))}
                    </div>
                    {editingId === unit.id && (
                      <input type="text" value={editShort} onChange={(e) => setEditShort(e.target.value)} className="w-16 p-1 text-sm border border-blue-200 rounded outline-none" placeholder="Sym" />
                    )}
                  </div>
                  {editingId === unit.id ? (
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full p-1.5 bg-gray-50 border border-blue-200 rounded-lg text-base font-semibold outline-none mb-1" />
                  ) : (
                    <h3 className="text-lg font-bold text-gray-800">{unit.name}</h3>
                  )}
                  <p className="text-xs text-gray-400">Measurement Unit</p>
                </div>
                <div className="flex flex-col gap-1">
                  {editingId === unit.id ? (
                    <>
                      <button onClick={() => saveEdit('unit')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(unit, 'unit')} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- REUSABLE ADD MODAL --- */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type={activeTab === 'categories' ? 'category' : 'unit'}
        onSuccess={fetchMetadata}
      />

      {/* --- VIEW PRODUCTS MODAL (Drill-Down) --- */}
      {viewCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${CATEGORY_STYLES[viewCategory.styleId !== undefined ? viewCategory.styleId : 0].bg} ${CATEGORY_STYLES[viewCategory.styleId !== undefined ? viewCategory.styleId : 0].text}`}>
                  {(() => {
                    const sId = viewCategory.styleId !== undefined ? viewCategory.styleId : 0;
                    const iconName = CATEGORY_STYLES[sId].icon;
                    const IconComp = ICON_MAP[iconName] || Package;
                    return <IconComp size={20} />
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{viewCategory.name}</h3>
                  <p className="text-xs text-gray-500">{getCategoryProducts().length} products found</p>
                </div>
              </div>
              <button onClick={() => setViewCategory(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Product List */}
            <div className="p-6 overflow-y-auto flex-1">
              {getCategoryProducts().length > 0 ? (
                <div className="space-y-3">
                  {getCategoryProducts().map(prod => (
                    <div key={prod.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                      <span className="font-medium text-gray-700">{prod.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
                  <p>No products in this category yet.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
              <button onClick={() => setViewCategory(null)} className="w-full py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Properties;