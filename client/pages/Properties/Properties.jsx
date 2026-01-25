import React, { useState } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Package, Scale, 
  Tag, Ruler, Check, X, ShoppingBag, Box, Coffee, 
  Zap, Heart, Smile, Star, Sun
} from 'lucide-react';
import { CATEGORY_STYLES, INITIAL_CATEGORIES, INITIAL_UNITS, allProducts } from '../../src/data/propertiesData';
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
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState(null); // For viewing products inside a category

  // Edit Mode
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editShort, setEditShort] = useState('');

  // Form State (For Adding)
  const [newItemName, setNewItemName] = useState('');
  const [newItemShort, setNewItemShort] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(0); // Index of selected style

  // --- 1. CONFIGURATION ---

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [units, setUnits] = useState(INITIAL_UNITS);


  // Get product count for a category
  const getProductCount = (catId) => {
    return allProducts.filter(p => p.categoryId === catId).length;
  };

  // Get products for the "View" modal
  const getCategoryProducts = () => {
    if (!viewCategory) return [];
    return allProducts.filter(p => p.categoryId === viewCategory.id);
  };

  // Filtering for Search
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUnits = units.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- 4. ACTIONS ---

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    if (activeTab === 'categories') {
      const newCat = {
        id: Date.now(),
        name: newItemName,
        styleId: selectedStyle // Saving the selected style ID
      };
      setCategories([...categories, newCat]);
    } else {
      const newUnit = {
        id: Date.now(),
        name: newItemName,
        short: newItemShort || newItemName.substring(0, 2).toLowerCase()
      };
      setUnits([...units, newUnit]);
    }

    // Reset & Close
    setNewItemName('');
    setNewItemShort('');
    setIsAddModalOpen(false);
  };

  const startEdit = (item, type) => {
    setEditingId(item.id);
    setEditValue(item.name);
    if (type === 'unit') setEditShort(item.short);
  };

  const saveEdit = (type) => {
    if (type === 'category') {
      setCategories(categories.map(c => c.id === editingId ? { ...c, name: editValue } : c));
    } else {
      setUnits(units.map(u => u.id === editingId ? { ...u, name: editValue, short: editShort } : u));
    }
    setEditingId(null);
  };

  const deleteItem = (id, type, e) => {
    e.stopPropagation(); // Prevent opening the category view
    if(window.confirm('Delete this item?')) {
      if (type === 'category') setCategories(categories.filter(c => c.id !== id));
      else setUnits(units.filter(u => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Categories & Units</h1>
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
        <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Tag size={16} /> Categories
          </button>
          <button 
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'units' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Scale size={16} /> Units
          </button>
        </div>

        <div className="relative w-full md:w-80 mr-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>

      {/* --- CATEGORIES GRID --- */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => {
            // Get the style object based on the saved ID (or default to 0)
            const style = CATEGORY_STYLES[cat.styleId] || CATEGORY_STYLES[0];
            const Icon = ICON_MAP[style.icon];

            return (
              <div 
                key={cat.id} 
                onClick={() => !editingId && setViewCategory(cat)} // CLICK TO VIEW PRODUCTS
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
                          <button onClick={() => saveEdit('category')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat, 'category')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                          <button onClick={(e) => deleteItem(cat.id, 'category', e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
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
                          {editingId === unit.id ? <Ruler size={16}/> : unit.short}
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
                        <button onClick={() => saveEdit('unit')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16}/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(unit, 'unit')} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={(e) => deleteItem(unit.id, 'unit', e)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD MODAL (With Style Picker) --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-gray-800">
                    Add {activeTab === 'categories' ? 'Category' : 'Unit'}
                 </h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input 
                      type="text" 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={activeTab === 'categories' ? "e.g. Frozen Foods" : "e.g. Milliliter"} 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-100" 
                    />
                 </div>
                 
                 {/* Unit Short Code Input */}
                 {activeTab === 'units' && (
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Code</label>
                      <input 
                        type="text" 
                        value={newItemShort}
                        onChange={(e) => setNewItemShort(e.target.value)}
                        placeholder="e.g. ml" 
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-100" 
                      />
                   </div>
                 )}

                 {/* CATEGORY STYLE PICKER */}
                 {activeTab === 'categories' && (
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Choose Style</label>
                      <div className="grid grid-cols-5 gap-3">
                        {CATEGORY_STYLES.map((style, index) => {
                          const Icon = style.icon;
                          const isSelected = selectedStyle === index;
                          return (
                            <button 
                              key={index}
                              onClick={() => setSelectedStyle(index)}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${style.bg} ${style.text} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                            >
                              <Icon size={20} />
                              {isSelected && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl"><Check size={20} className="text-white drop-shadow-md"/></div>}
                            </button>
                          )
                        })}
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex gap-3 mt-8">
                 <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">Cancel</button>
                 <button onClick={handleAddItem} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-colors">Save</button>
              </div>
           </div>
        </div>
      )}

      {/* --- VIEW PRODUCTS MODAL (Drill-Down) --- */}
      {viewCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${CATEGORY_STYLES[viewCategory.styleId].bg} ${CATEGORY_STYLES[viewCategory.styleId].text}`}>
                       {React.createElement(CATEGORY_STYLES[viewCategory.styleId].icon, {size: 20})}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-gray-800">{viewCategory.name}</h3>
                       <p className="text-xs text-gray-500">{getCategoryProducts().length} items found</p>
                    </div>
                 </div>
                 <button onClick={() => setViewCategory(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
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
                      <ShoppingBag size={40} className="mx-auto mb-3 opacity-20"/>
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