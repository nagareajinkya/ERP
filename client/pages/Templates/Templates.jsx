import React, { useState, useRef } from 'react';
import {
  MessageSquare, Send, Smartphone,
  User, IndianRupee, Hash, Store, Plus,
  Trash2, Edit2, X, Users, Search, Check,
  MessageCircle, Receipt, Download, ShieldCheck, ChevronRight
} from 'lucide-react';
import FormLabel from '../../components/common/FormLabel';
import { INITIAL_TEMPLATES, TEMPLATE_PARTIES } from './../../src/data/templateData';

// --- CUSTOM WHATSAPP ICON COMPONENT ---
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="currentColor" className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Templates = () => {
  // --- MOCK DATA ---
  const [templates, setTemplates] = useState([INITIAL_TEMPLATES]);

  const [parties] = useState([TEMPLATE_PARTIES]);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('manage');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedForBroadcast, setSelectedForBroadcast] = useState(null);
  const [checkedParties, setCheckedParties] = useState([]);

  // --- EDITOR STATE ---
  const [tempName, setTempName] = useState('');
  const [tempCategory, setTempCategory] = useState('Payment');
  const [messageText, setMessageText] = useState('');
  const textAreaRef = useRef(null);

  // --- HANDLERS ---
  const insertVariable = (variable) => {
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const text = messageText;
    setMessageText(text.substring(0, start) + `{${variable}}` + text.substring(end));
    textAreaRef.current.focus();
  };

  const getPreviewText = (rawText) => {
    return rawText
      .replace(/{customer_name}/g, 'Ramesh Gupta')
      .replace(/{pending_amount}/g, '4,500')
      .replace(/{order_id}/g, 'ORD-2026')
      .replace(/{business_name}/g, 'Shri Gurudev Mart');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Message Templates</h1>
          <p className="text-sm text-gray-500 font-medium">Create and send automated messages to your customers.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button onClick={() => setActiveTab('manage')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'manage' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Manage</button>
          <button onClick={() => setActiveTab('broadcast')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'broadcast' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Broadcast</button>
        </div>
      </div>

      {activeTab === 'manage' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* TEMPLATE LIST */}
          <div className="lg:col-span-1 space-y-4">
            <button
              onClick={() => { setEditingTemplate(null); setTempName(''); setMessageText(''); setIsEditorOpen(true); }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-all font-bold"
            >
              <Plus size={20} /> Create New Template
            </button>

            {templates.map(t => (
              <div key={t.id} onClick={() => { setEditingTemplate(t); setTempName(t.name); setMessageText(t.text); setTempCategory(t.category); setIsEditorOpen(true); }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${t.category === 'Payment' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {t.category}
                  </span>
                  <WhatsAppIcon size={14} className="text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{t.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 font-medium mt-1">{t.text}</p>
              </div>
            ))}
          </div>

          {/* EDITOR SECTION */}
          {isEditorOpen ? (
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">

              <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800">Edit Template</h2>
                  <button onClick={() => setIsEditorOpen(false)}><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormLabel text="Name" className="text-[10px] font-black text-gray-400 uppercase ml-1" />
                      <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none mt-1" />
                    </div>
                    <div>
                      <FormLabel text="Category" className="text-[10px] font-black text-gray-400 uppercase ml-1" />
                      <select value={tempCategory} onChange={e => setTempCategory(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none mt-1">
                        <option>Payment</option><option>Order</option><option>Marketing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <FormLabel text="Content" className="text-[10px] font-black text-gray-400 uppercase ml-1" />
                    <div className="flex flex-wrap gap-2 my-2">
                      {['customer_name', 'pending_amount', 'order_id', 'business_name'].map(tag => (
                        <button key={tag} onClick={() => insertVariable(tag)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all">
                          {tag.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                    <textarea
                      ref={textAreaRef}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      className="w-full h-48 p-4 bg-gray-50 border-none rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                  <button className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl">Delete</button>
                  <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Save</button>
                </div>
              </div>

              {/* PHONE PREVIEW */}
              <div className="hidden md:flex flex-col items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">WhatsApp Preview</p>
                <div className="w-[260px] h-[480px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col">
                  <div className="flex-1 bg-[#E5DDD5] flex flex-col p-3 pt-10">
                    <div className="self-end max-w-[90%] bg-white p-3 rounded-xl rounded-tr-none shadow-sm relative">
                      <p className="text-[10px] leading-relaxed text-gray-800 whitespace-pre-wrap">{getPreviewText(messageText) || '...'}</p>
                      <p className="text-[7px] text-right text-gray-400 mt-1">12:31 PM ✓✓</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 h-[500px] flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[32px]">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">Select a template to view details</p>
            </div>
          )}
        </div>
      ) : (
        /* --- BROADCAST MODE --- */
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">1. Choose Message</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {templates.map(t => (
                <button key={t.id} onClick={() => setSelectedForBroadcast(t)} className={`flex-shrink-0 px-6 py-4 rounded-xl border-2 transition-all ${selectedForBroadcast?.id === t.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-50 bg-gray-50 text-gray-500'}`}>
                  <p className="font-bold text-sm">{t.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">2. Select Customers</h3>
              <button className="text-xs font-bold text-blue-600">Select All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parties.map(p => (
                <div key={p.id} onClick={() => setCheckedParties(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${checkedParties.includes(p.id) ? 'border-green-500 bg-green-50' : 'border-gray-50 bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${checkedParties.includes(p.id) ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>{checkedParties.includes(p.id) && <Check size={14} className="text-white" />}</div>
                    <div><p className="text-sm font-bold text-gray-800">{p.name}</p></div>
                  </div>
                  {p.balance > 0 && <span className="text-[10px] font-black text-red-500">₹{p.balance} DUE</span>}
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-5 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-3 disabled:opacity-30" disabled={!selectedForBroadcast || checkedParties.length === 0}>
            <WhatsAppIcon size={24} /> SEND TO {checkedParties.length} CUSTOMERS
          </button>
        </div>
      )}

    </div>
  );
};

export default Templates;