import React, { useState } from 'react';
import { 
  User, Upload, CreditCard, Landmark, 
  Bell, Shield, Lock, Eye, EyeOff, Save, X, 
  CheckCircle2, Plus, Edit2, AlertTriangle, FileText
} from 'lucide-react';
import { allCategories, initialData } from './../../src/data/profileData';

const Profile = () => {
  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [verifyPasswordInput, setVerifyPasswordInput] = useState('');

  // Business Category State
  const [categories, setCategories] = useState(['Retail Store']);
  const [categoryInput, setCategoryInput] = useState('');
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const [formData, setFormData] = useState(initialData);

  // Notifications (Auto-Save Independent of Edit Mode)
  const [notifications, setNotifications] = useState({
    sales: true,
    payments: true,
    lowStock: false
  });

  // --- LOGIC ---

  const getFilteredCategories = () => {
    return allCategories.filter(cat => 
      !categories.includes(cat) && 
      cat.toLowerCase().includes(categoryInput.toLowerCase())
    );
  };

  const addCategory = (cat) => {
    if (!categories.includes(cat)) setCategories([...categories, cat]);
    setCategoryInput('');
    setShowCatDropdown(false);
  };

  const removeCategory = (catToRemove) => {
    if (isEditing) {
      setCategories(categories.filter(c => c !== catToRemove));
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAttempt = () => {
    const sensitiveChanged = 
      formData.fullName !== initialData.fullName ||
      formData.phone !== initialData.phone ||
      formData.email !== initialData.email;

    if (sensitiveChanged) {
      setIsVerifyModalOpen(true);
    } else {
      commitSave();
    }
  };

  const commitSave = () => {
    setIsEditing(false);
    setIsVerifyModalOpen(false);
    setVerifyPasswordInput('');
    console.log("Changes Saved", formData);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 p-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business details</p>
        </div>
        
        <div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="px-6 py-2.5 text-gray-600 bg-white border border-gray-200 font-medium hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAttempt}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-green-200 transition-all"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* LEFT COLUMN (General & Bank) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* GENERAL INFO */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 relative overflow-hidden">
            {!isEditing && <div className="absolute top-0 left-0 w-full bg-gray-100"></div>}
            
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><User size={20} /></div>
               <h2 className="text-lg font-bold text-gray-800">General Information</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start mb-8 border-b border-gray-50 pb-8">
                {/* Photo Upload */}
                <div className={`flex-shrink-0 group relative ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                   <div className={`w-28 h-28 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 transition-all ${isEditing ? 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-500' : 'border border-gray-100'}`}>
                      {isEditing ? <Upload size={24} /> : <User size={40} className="text-gray-300"/>}
                   </div>
                   {isEditing && <span className="text-xs font-medium text-gray-500 mt-2 block text-center">Change</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" disabled={!isEditing} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <input type="text" disabled={!isEditing} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" disabled={!isEditing} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                   </div>
                </div>
            </div>

            {/* Shop Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name</label>
                  <input type="text" disabled={!isEditing} value={formData.shopName} onChange={(e) => setFormData({...formData, shopName: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                </div>
                
                {/* Category Multi-Select */}
                <div className="md:col-span-2 relative">
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Categories</label>
                   <div className={`w-full min-h-[50px] px-2 py-2 rounded-xl flex flex-wrap gap-2 items-center border transition-all ${isEditing ? 'bg-white border-gray-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50' : 'bg-gray-50 border-transparent'}`}>
                      {categories.map((cat) => (
                        <span key={cat} className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5">
                          {cat}
                          {isEditing && <button onClick={() => removeCategory(cat)} className="text-blue-400 hover:text-red-500"><X size={14}/></button>}
                        </span>
                      ))}
                      {isEditing && (
                        <input type="text" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} onFocus={() => setShowCatDropdown(true)} placeholder={categories.length === 0 ? "Select category..." : ""} className="bg-transparent outline-none flex-1 min-w-[120px] text-sm px-2 py-1" />
                      )}
                   </div>
                   {isEditing && showCatDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-10 max-h-48 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
                        {getFilteredCategories().length > 0 ? (
                          getFilteredCategories().map(cat => (<button key={cat} onClick={() => addCategory(cat)} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">{cat}</button>))
                        ) : categoryInput && (<button onClick={() => addCategory(categoryInput)} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={14} /> Add "{categoryInput}"</button>)}
                      </div>
                   )}
                   {showCatDropdown && <div className="fixed inset-0 z-0" onClick={() => setShowCatDropdown(false)}></div>}
                </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                   <input type="text" disabled={!isEditing} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                   <input type="text" disabled={!isEditing} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                      <input type="text" disabled={!isEditing} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                      <input type="text" disabled={!isEditing} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-blue-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                   </div>
                </div>
            </div>
          </div>

          {/* BANKING CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><CreditCard size={20} /></div>
               <h2 className="text-lg font-bold text-gray-800">Billing & Banking</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1.5">GSTIN</label>
                     <input type="text" disabled={!isEditing} value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-purple-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID (QR Code)</label>
                     <input type="text" disabled={!isEditing} value={formData.upiId} onChange={(e) => setFormData({...formData, upiId: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-purple-100' : 'bg-gray-50 border-transparent text-gray-600'}`} />
                  </div>
               </div>

               <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Landmark size={14} /> Bank Details
                  </h3>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Account Holder</label>
                        <input type="text" disabled={!isEditing} value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm text-gray-800 outline-none ${isEditing ? 'bg-white border border-purple-200' : 'bg-purple-50/50 border-transparent'}`} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-medium text-gray-600 mb-1">Account No.</label>
                           <input type="text" disabled={!isEditing} value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm text-gray-800 outline-none ${isEditing ? 'bg-white border border-purple-200' : 'bg-purple-50/50 border-transparent'}`} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-600 mb-1">IFSC Code</label>
                           <input type="text" disabled={!isEditing} value={formData.ifsc} onChange={(e) => setFormData({...formData, ifsc: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm text-gray-800 outline-none ${isEditing ? 'bg-white border border-purple-200' : 'bg-purple-50/50 border-transparent'}`} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-1 space-y-8">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><Bell size={20} /></div>
               <h2 className="text-lg font-bold text-gray-800">Preferences</h2>
            </div>

            {/* Notifications */}
            <div className="mb-8">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Notifications</h3>
               <div className="space-y-4">
                  {['Sales Notifications', 'Payment Alerts', 'Low Stock Warnings'].map((label, index) => {
                     const key = index === 0 ? 'sales' : index === 1 ? 'payments' : 'lowStock';
                     const isOn = notifications[key];
                     return (
                       <div key={key} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <button 
                            onClick={() => toggleNotification(key)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${isOn ? (key === 'lowStock' ? 'bg-orange-600' : 'bg-blue-600') : 'bg-gray-200'}`}
                          >
                             <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                       </div>
                     );
                  })}
               </div>
            </div>

            {/* Invoice Settings (ADDED HERE) */}
            <div className="mb-8">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Invoice Settings</h3>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice Prefix</label>
                  <input 
                    type="text" 
                    disabled={!isEditing} 
                    value={formData.invoicePrefix} 
                    onChange={(e) => setFormData({...formData, invoicePrefix: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border border-gray-200 focus:ring-2 focus:ring-orange-100' : 'bg-gray-50 border-transparent text-gray-600'}`} 
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Ex: INV-2024-001</p>
               </div>
            </div>

            {/* Security */}
            <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Security</h3>
               <button 
                 onClick={() => setIsChangePassModalOpen(true)}
                 className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors group"
               >
                  <div className="flex items-center gap-3">
                     <Shield size={18} className="group-hover:scale-110 transition-transform" /> 
                     <span className="text-sm font-semibold">Change Password</span>
                  </div>
                  <Lock size={16} className="opacity-50"/>
               </button>
            </div>
          </div>

          {/* DOCUMENTS SECTION (ADDED HERE) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Documents</h3>
             <div className="space-y-4">
                {['Shop Owner Signature', 'Shop Stamp'].map((item) => (
                   <div key={item} className={`border border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-between transition-colors group ${isEditing ? 'hover:bg-blue-50 cursor-pointer border-blue-200' : 'opacity-70 cursor-not-allowed'}`}>
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                           <FileText size={18}/>
                         </div>
                         <span className="text-sm font-medium text-gray-700">{item}</span>
                      </div>
                      {isEditing && <Upload size={16} className="text-gray-400 group-hover:text-blue-500" />}
                   </div>
                ))}
             </div>
          </div>

        </div>
      </div>

      {/* --- VERIFY PASSWORD MODAL --- */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
              <div className="flex items-center gap-3 text-orange-600 mb-4">
                 <div className="p-2 bg-orange-100 rounded-full"><AlertTriangle size={24} /></div>
                 <h3 className="text-lg font-bold text-gray-800">Security Check</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">You are changing sensitive information. Please enter your password to confirm.</p>
              <input type="password" value={verifyPasswordInput} onChange={(e) => setVerifyPasswordInput(e.target.value)} className="w-full px-4 py-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-100" placeholder="Enter password" />
              <div className="flex gap-3">
                 <button onClick={() => setIsVerifyModalOpen(false)} className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl">Cancel</button>
                 <button onClick={commitSave} className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">Confirm</button>
              </div>
           </div>
        </div>
      )}

      {/* --- CHANGE PASSWORD MODAL --- */}
      {isChangePassModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
                  <button onClick={() => setIsChangePassModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
               </div>
               <div className="p-6 space-y-4">
                  <input type="password" placeholder="Current Password" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none"/>
                  <input type="password" placeholder="New Password" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none"/>
                  <input type="password" placeholder="Confirm New Password" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none"/>
               </div>
               <div className="p-6 pt-2 flex gap-3">
                  <button onClick={() => setIsChangePassModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl">Cancel</button>
                  <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl">Update</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Profile;