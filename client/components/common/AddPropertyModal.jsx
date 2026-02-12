import React, { useState, useEffect } from 'react';
import { X, Check, Package, ShoppingBag, Star, Coffee, Zap, Heart, Box, Tag, Sun, Smile } from 'lucide-react';
import FormLabel from './FormLabel';
import api from '../../src/api';
import { CATEGORY_STYLES } from '../../src/data/propertiesData';

// Reusing the icon map logic (Should practically be in a shared utility or context if growing larger)
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

const AddPropertyModal = ({ isOpen, onClose, type = 'category', onSuccess, initialName = '' }) => {
    // Type can be 'category' or 'unit'
    const [name, setName] = useState('');
    const [shortCode, setShortCode] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setShortCode('');
            setSelectedStyle(0);
        }
    }, [isOpen, initialName]);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            if (type === 'category') {
                await api.post('/trading/categories', {
                    name: name,
                    styleId: selectedStyle
                });
            } else {
                await api.post('/trading/units', {
                    name: name,
                    symbol: shortCode || name.substring(0, 3).toLowerCase() // Default logic if empty
                });
            }

            if (onSuccess) onSuccess(name); // Pass back name to auto-fill if needed
            onClose();
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
            alert(`Failed to create ${type}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 capitalize">
                        Add New {type}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <FormLabel text="Name" className="block text-sm font-medium text-gray-700 mb-1.5" />
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={type === 'category' ? "e.g. Frozen Foods" : "e.g. Milliliter"}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                        />
                    </div>

                    {/* Unit Short Code Input */}
                    {type === 'unit' && (
                        <div>
                            <FormLabel text="Short Code" className="block text-sm font-medium text-gray-700 mb-1.5" />
                            <input
                                type="text"
                                value={shortCode}
                                onChange={(e) => setShortCode(e.target.value)}
                                placeholder="e.g. ML"
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                            />
                        </div>
                    )}

                    {/* CATEGORY STYLE PICKER */}
                    {type === 'category' && (
                        <div>
                            <FormLabel text="Choose Style" className="block text-sm font-medium text-gray-700 mb-3" />
                            <div className="grid grid-cols-5 gap-3">
                                {CATEGORY_STYLES.map((style, index) => {
                                    const Icon = ICON_MAP[style.icon] || Package;
                                    const isSelected = selectedStyle === index;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedStyle(index)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${style.bg} ${style.text} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                                        >
                                            <Icon size={20} />
                                            {isSelected && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl"><Check size={20} className="text-white drop-shadow-md" /></div>}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPropertyModal;
