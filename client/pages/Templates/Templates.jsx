import React, { useState, useRef } from 'react';
import {
  MessageSquare, Send, Smartphone,
  User, IndianRupee, Hash, Store, Plus,
  Trash2, Edit2, X, Users, Search, Check,
  MessageCircle, Receipt, Download, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useEffect } from 'react';
import api from '../../src/api';
import { toast } from 'react-toastify';
import FormLabel from '../../components/common/FormLabel';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import BroadcastModal from '../../components/templates/BroadcastModal';

import WhatsAppIcon from '../../components/ui/WhatsAppIcon';

const Templates = () => {
  // --- STATE ---
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Trigger re-fetch

  const [parties, setParties] = useState([]);
  const [offers, setOffers] = useState([]);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('manage');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedForBroadcast, setSelectedForBroadcast] = useState(null);
  const [checkedParties, setCheckedParties] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessages, setBroadcastMessages] = useState([]);

  // --- EDITOR STATE ---
  const [tempName, setTempName] = useState('');
  const [tempCategory, setTempCategory] = useState('Payment');
  const [tempOfferId, setTempOfferId] = useState(''); // For Offer templates
  const [messageText, setMessageText] = useState('');
  const textAreaRef = useRef(null);

  const [businessProfile, setBusinessProfile] = useState(null);

  // --- EFFECTS ---
  useEffect(() => {
    fetchTemplates();
    fetchParties();
    fetchOffers();
    fetchProfile();
  }, [refreshKey]);

  // Reset checked parties when broadcast template changes
  useEffect(() => {
    if (selectedForBroadcast) {
      const filtered = getFilteredParties();
      // Auto-select valid parties is a nice to have, but maybe let user select?
      // Let's default to creating a list of IDs that *can* be selected, or just clear selection.
      // User asked: "if we select offer type then only the customers who the offer is for they should get selected"
      // Interpretation: The list should be filtered. User can then "Select All" from that filtered list.
      setCheckedParties([]);
    }
  }, [selectedForBroadcast]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/smart-ops/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await api.get('/parties'); // Standard parties enpoint
      setParties(res.data);
    } catch (err) {
      console.error("Error fetching parties:", err);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await api.get('/smart-ops/offers');
      // Only active and selected offers
      setOffers(res.data.filter(o => o.status === 'active' || o.status === 'scheduled'));
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setBusinessProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // --- HANDLERS ---
  const handleSave = async () => {
    if (!tempName || !messageText) return;

    try {
      const templateData = {
        name: tempName,
        category: tempCategory,
        text: messageText,
        type: 'whatsapp', // Default type
        offerId: tempCategory === 'Offer' ? tempOfferId : undefined
      };

      if (editingTemplate) {
        // Update
        await api.put(`/smart-ops/templates/${editingTemplate.id}`, templateData);
      } else {
        // Create
        await api.post('/smart-ops/templates', templateData);
      }

      setIsEditorOpen(false);
      setEditingTemplate(null);
      setRefreshKey(prev => prev + 1); // Refresh list
    } catch (err) {
      console.error("Error saving template:", err);
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async () => {
    if (!editingTemplate) return;

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/smart-ops/templates/${editingTemplate.id}`);
      setIsEditorOpen(false);
      setEditingTemplate(null);
      setShowDeleteConfirm(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting template:", err);
      toast.error("Failed to delete template");
    }
  };

  const insertVariable = (variable) => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = messageText;
    const newText = text.substring(0, start) + `{${variable}}` + text.substring(end);

    setMessageText(newText);

    // Calculate new cursor position
    const newCursorPos = start + variable.length + 2; // +2 for {}

    // Restore focus and cursor position after React render cycle
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const getPreviewText = (rawText) => {
    // 1. Customer Data (Placeholders for clarity)
    const customer = { name: '[Customer Name]', currentBalance: '[Amount]' };

    // 2. Business Data
    const businessName = businessProfile?.businessName || 'Shri Gurudev Mart';
    const businessAddress = businessProfile ? `${businessProfile.address}, ${businessProfile.city}` : 'MG Road, Pune';
    const businessMobile = businessProfile?.phone || '+91 98765 43210';

    // 3. Offer Data
    let offerName = '[Offer Name]';
    let offerDiscount = '[Offer Discount]';
    let offerStartDate = '[Start Date]';
    let offerEndDate = '[End Date]';

    if (tempCategory === 'Offer' && tempOfferId) {
      const selectedOffer = offers.find(o => o.id === tempOfferId);
      if (selectedOffer) {
        offerName = selectedOffer.name;
        // Use the description generated by the backend (e.g., "20% Off on Bill > 500")
        offerDiscount = selectedOffer.description || selectedOffer.ruleType;

        if (selectedOffer.startDate) {
          offerStartDate = new Date(selectedOffer.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
        if (selectedOffer.endDate) {
          offerEndDate = new Date(selectedOffer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        } else {
          offerEndDate = 'Ongoing';
        }
      }
    }

    // 4. Current Date
    const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return rawText
      .replace(/{customer_name}/g, customer.name)
      .replace(/{pending_amount}/g, customer.currentBalance)
      .replace(/{business_name}/g, businessName)
      .replace(/{current_date}/g, currentDate)
      .replace(/{business_address}/g, businessAddress)
      .replace(/{business_mobile}/g, businessMobile)
      .replace(/{offer_name}/g, offerName)
      .replace(/{offer_discount}/g, offerDiscount)
      .replace(/{offer_start_date}/g, offerStartDate)
      .replace(/{offer_end_date}/g, offerEndDate);
  };

  const openNewEditor = () => {
    setEditingTemplate(null);
    setTempName('');
    setMessageText('');
    setTempCategory('Payment');
    setTempOfferId('');
    setIsEditorOpen(true);
  };

  const openEditEditor = (t) => {
    setEditingTemplate(t);
    setTempName(t.name);
    setMessageText(t.text);
    setTempCategory(t.category);
    setTempOfferId(t.offerId?._id || t.offerId || ''); // Handle populated or raw ID
    setIsEditorOpen(true);
  };

  // --- FILTERING LOGIC ---
  const getFilteredParties = () => {
    if (!selectedForBroadcast) return [];

    switch (selectedForBroadcast.category) {

      case 'Offer':
        if (!selectedForBroadcast.offerId) return []; // Should not happen if linked correctly
        // selectedForBroadcast.offerId should be populated object
        const allowedIds = selectedForBroadcast.offerId.selectedCustomers || [];
        // If selectedCustomers is empty or 'all', maybe show all?
        // Assuming 'selectedCustomers' contains IDs. Check Offer schema usage.
        // In Offer Schema: selectedCustomers: [{ type: String }] // Array of Customer IDs
        if (selectedForBroadcast.offerId.targetType === 'all') return parties;
        return parties.filter(p => allowedIds.includes(p.id.toString())); // Verify ID type (string vs number)

      case 'Payment':
        // For payment reminders, only show customers with outstanding balance
        return parties.filter(p => p.currentBalance > 0);

      case 'Marketing':
      case 'Order':
      default:
        return parties;
    }
  };

  const filteredParties = getFilteredParties();

  const handleSelectAll = () => {
    if (checkedParties.length === filteredParties.length) {
      setCheckedParties([]);
    } else {
      setCheckedParties(filteredParties.map(p => p.id));
    }
  };

  const handleBroadcastClick = async () => {
    if (!selectedForBroadcast || checkedParties.length === 0) return;

    try {
      const response = await api.post('/smart-ops/templates/generate-messages', {
        templateId: selectedForBroadcast.id,
        customerIds: checkedParties,
        parties: parties, // Send parties data that we already have
        businessProfile: businessProfile // Send business profile that we already have
      });

      setBroadcastMessages(response.data.messages);
      setShowBroadcastModal(true);
    } catch (err) {
      console.error('Error generating messages:', err);
      toast.error('Failed to generate messages. Please try again.');
    }
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
              onClick={openNewEditor}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-all font-bold"
            >
              <Plus size={20} /> Create New Template
            </button>

            {loading ? <p className="text-center text-gray-400">Loading templates...</p> : templates.map(t => (
              <div key={t.id} onClick={() => openEditEditor(t)} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest 
                    ${t.category === 'Offer' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                    {t.category}
                  </span>
                  <WhatsAppIcon size={14} className="text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{t.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 font-medium mt-1">{t.text}</p>
                {t.category === 'Offer' && t.offerId && (
                  <p className="text-[10px] text-purple-500 font-bold mt-2">Linked to: {t.offerId.name || 'Unknown Offer'}</p>
                )}
              </div>
            ))}
          </div>

          {/* EDITOR SECTION */}
          {isEditorOpen ? (
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">

              <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
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
                        <option>Payment</option><option>Order</option><option>Marketing</option><option>Offer</option>
                      </select>
                    </div>
                  </div>

                  {/* OFFER SELECTION (If Category is Offer) */}
                  {tempCategory === 'Offer' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <FormLabel text="Select Linked Offer" className="text-[10px] font-black text-purple-500 uppercase ml-1" />
                      <select value={tempOfferId} onChange={e => setTempOfferId(e.target.value)} className="w-full p-3 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm outline-none mt-1 border border-purple-100">
                        <option value="">-- Select an Active Offer --</option>
                        {offers.map(o => (
                          <option key={o.id} value={o.id}>{o.name} ({o.ruleType})</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">This template will default to customers eligible for this offer.</p>
                    </div>
                  )}

                  <div>
                    <FormLabel text="Content" className="text-[10px] font-black text-gray-400 uppercase ml-1" />

                    {/* General Variables */}
                    <div className="flex flex-wrap gap-2 my-2">
                      {['business_name', 'customer_name', 'pending_amount', 'current_date', 'business_address', 'business_mobile'].map(tag => (
                        <button key={tag} onClick={() => insertVariable(tag)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all">
                          {tag.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    {/* Offer Specific Variables - Only show if Offer is selected */}
                    {tempCategory === 'Offer' && (
                      <div className="flex flex-wrap gap-2 mb-2 animate-in fade-in">
                        {['offer_name', 'offer_discount', 'offer_start_date', 'offer_end_date'].map(tag => (
                          <button key={tag} onClick={() => insertVariable(tag)} className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-purple-600 hover:text-white transition-all">
                            {tag.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}

                    <textarea
                      ref={textAreaRef}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      className="w-full h-48 p-4 bg-gray-50 border-none rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                  {editingTemplate && (
                    <button onClick={handleDelete} className="flex-1 py-3 bg-white border border-gray-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all">Delete</button>
                  )}
                  <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">Save</button>
                </div>
              </div>

              {/* PHONE PREVIEW */}
              <div className="hidden md:flex flex-col items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Message Preview</p>
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
                  {t.category === 'Offer' && (
                    <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-md mt-1 inline-block">Offer Linked</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                2. Select Customers
                {selectedForBroadcast && <span className="text-gray-400 normal-case ml-2">({filteredParties.length} available)</span>}
              </h3>
              <button onClick={handleSelectAll} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                {checkedParties.length === filteredParties.length && filteredParties.length > 0 ? "Deselect All" : "Select All"}
              </button>
            </div>
            {filteredParties.length === 0 ? (
              <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-sm">No customers match the criteria for this template type.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredParties.map(p => (
                  <div key={p.id} onClick={() => setCheckedParties(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${checkedParties.includes(p.id) ? 'border-green-500 bg-green-50' : 'border-gray-50 bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${checkedParties.includes(p.id) ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>{checkedParties.includes(p.id) && <Check size={14} className="text-white" />}</div>
                      <div><p className="text-sm font-bold text-gray-800">{p.name}</p></div>
                    </div>
                    {p.currentBalance > 0 && <span className="text-[10px] font-black text-red-500">₹{p.currentBalance} DUE</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleBroadcastClick}
            className="w-full py-5 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-3 disabled:opacity-30 hover:bg-green-700 hover:shadow-2xl disabled:hover:bg-green-600"
            disabled={!selectedForBroadcast || checkedParties.length === 0}
          >
            <WhatsAppIcon size={24} /> SEND TO {checkedParties.length} CUSTOMERS
          </button>
        </div>
      )}

      {/* BROADCAST MODAL */}
      {showBroadcastModal && (
        <BroadcastModal
          messages={broadcastMessages}
          templateName={selectedForBroadcast?.name || 'Template'}
          onClose={() => setShowBroadcastModal(false)}
        />
      )}

    </div>
  );
};
export default Templates;