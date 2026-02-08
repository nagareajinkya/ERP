import React, { useState, useEffect } from 'react';
import {
   User, CreditCard, Landmark,
   Bell, Shield, Lock, Save, X,
   Edit2, AlertTriangle, FileText,
   MapPin, Phone, Mail, Building, FileCheck
} from 'lucide-react';
import api from '../../src/api';
import { toast } from 'react-toastify';
import FormLabel from '../../components/common/FormLabel';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/ImageUploader';

const Profile = () => {
   // --- STATE ---
   const [isEditing, setIsEditing] = useState(false);
   const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
   const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
   const [verifyPasswordInput, setVerifyPasswordInput] = useState('');

   // Upload Modal State
   const [uploadModalType, setUploadModalType] = useState(null); // 'profile-photo' | 'signature' | 'stamp' | null

   // Change Password State
   const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

   const [initialData, setInitialData] = useState({});
   const [formData, setFormData] = useState({
      fullName: '', phone: '', email: '',
      businessName: '', gstin: '', upiId: '',
      address: '', city: '', state: '', pincode: '',
      accountName: '', accountNumber: '', ifsc: '',
      invoicePrefix: '',
      profilePicUrl: '',
      signatureUrl: '',
      stampUrl: '',
   });

   // Preferences
   const [alwaysShowPaymentQr, setAlwaysShowPaymentQr] = useState(false);

   const { checkAuth } = useAuth();

   // --- EFFECTS ---
   useEffect(() => {
      fetchProfile();
   }, []);

   const fetchProfile = async () => {
      try {
         const { data } = await api.get('/auth/profile');
         setFormData(data);
         setInitialData(data);
         setAlwaysShowPaymentQr(data.alwaysShowPaymentQr);
      } catch (error) {
         console.error("Failed to fetch profile", error);
         toast.error("Failed to load profile data.");
      }
   };

   // --- LOGIC ---
   const togglePaymentQr = () => {
      setAlwaysShowPaymentQr(prev => !prev);
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

   const commitSave = async () => {
      try {
         const payload = {
            ...formData,
            alwaysShowPaymentQr: alwaysShowPaymentQr,
            verificationPassword: verifyPasswordInput // Include password for verification
         };
         await api.put('/auth/profile', payload);

         await checkAuth(); // Refresh global auth state

         setIsEditing(false);
         setIsVerifyModalOpen(false);
         setVerifyPasswordInput('');
         await fetchProfile(); // Refresh local form
         toast.success("Profile updated successfully!");
      } catch (error) {
         console.error("Failed to update profile", error);
         toast.error("Failed to update profile.");
      }
   };

   const handleCancel = () => {
      setFormData(initialData);
      setIsEditing(false);
   };

   const handleChangePassword = async () => {
      if (passData.new !== passData.confirm) {
         toast.error("New passwords do not match!");
         return;
      }
      try {
         await api.post('/auth/change-password', {
            currentPassword: passData.current,
            newPassword: passData.new
         });
         setIsChangePassModalOpen(false);
         setPassData({ current: '', new: '', confirm: '' });
         toast.success("Password changed successfully!");
      } catch (error) {
         console.error("Failed to change password", error);
         toast.error(error.response?.data?.message || "Failed to change password.");
      }
   };

   // Helper to verify if an image URL is valid/present
   const hasImage = (url) => url && url.length > 10;

   return (
      <div className="min-h-screen bg-gray-50/50 p-6 font-sans">

         {/* --- HEADER (Matching App Theme) --- */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
               <p className="text-sm text-gray-500 font-medium">Manage your business profile and preferences.</p>
            </div>

            {/* Action Buttons */}
            <div>
               {!isEditing ? (
                  <button
                     onClick={() => setIsEditing(true)}
                     className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
                  >
                     <Edit2 size={16} /> Edit Profile
                  </button>
               ) : (
                  <div className="flex gap-3">
                     <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 text-gray-600 bg-white border border-gray-200 font-bold hover:bg-gray-50 rounded-xl transition-colors active:scale-[0.98]"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSaveAttempt}
                        className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
                     >
                        <Save size={18} /> Save Changes
                     </button>
                  </div>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* LEFT COLUMN (Profile Card) */}
            <div className="xl:col-span-1 space-y-6">

               {/* Profile Card */}
               <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100"></div>

                  {/* Profile Picture */}
                  <div className="relative group mb-4 z-10">
                     <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl ring-4 ring-gray-50 relative overflow-hidden">
                        {hasImage(formData.profilePicUrl) ? (
                           <img src={formData.profilePicUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                           <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                              <User size={48} />
                           </div>
                        )}
                     </div>

                     <button
                        onClick={() => setUploadModalType('profile-photo')}
                        className="absolute bottom-1 right-1 bg-gray-900 hover:bg-black text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                        title="Change Profile Photo"
                     >
                        <Edit2 size={14} />
                     </button>
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 mb-1 z-10">{formData.fullName || 'User Name'}</h2>
                  <p className="text-gray-500 font-medium mb-6 text-sm z-10">{formData.businessName || 'Business Name'}</p>

                  <div className="w-full space-y-4 pt-4 border-t border-gray-50 z-10">
                     <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <div className="p-2 bg-white text-gray-600 rounded-lg shadow-sm"><Phone size={16} /></div>
                        <div className="text-left flex-1">
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                           <input
                              type="text"
                              disabled={!isEditing}
                              value={formData.phone || ''}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className={`w-full bg-transparent font-semibold text-sm outline-none text-gray-700 ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`}
                              placeholder="Phone Number"
                           />
                        </div>
                     </div>
                     <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <div className="p-2 bg-white text-gray-600 rounded-lg shadow-sm"><Mail size={16} /></div>
                        <div className="text-left flex-1">
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                           <input
                              type="email"
                              disabled={!isEditing}
                              value={formData.email || ''}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className={`w-full bg-transparent font-semibold text-sm outline-none text-gray-700 ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`}
                              placeholder="Email Address"
                           />
                        </div>
                     </div>
                     <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <div className="p-2 bg-white text-gray-600 rounded-lg shadow-sm"><MapPin size={16} /></div>
                        <div className="text-left flex-1">
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                           <p className="text-sm font-semibold truncate text-gray-700">{formData.city || '-'}, {formData.state || '-'} - {formData.pincode}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Preferences */}
               <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-gray-50 text-gray-600 rounded-xl"><Bell size={20} /></div>
                     <h2 className="text-lg font-bold text-gray-800">Preferences</h2>
                  </div>

                  <div className="space-y-6">
                     {/* Notifications */}
                     {/* Payment QR Toggle */}
                     <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Invoice Settings</h3>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                           <span className="text-sm font-semibold text-gray-600">Always Show Payment QR</span>
                           <button
                              onClick={togglePaymentQr}
                              disabled={!isEditing}
                              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out flex items-center ${alwaysShowPaymentQr ? 'bg-gray-800' : 'bg-gray-200'} ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                           >
                              <span className={`inline-block w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${alwaysShowPaymentQr ? 'translate-x-6' : 'translate-x-1'}`} />
                           </button>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-gray-50">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                           <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Invoice Prefix</label>
                           <div className="flex items-center gap-2">
                              <FileText size={16} className="text-gray-400" />
                              <input
                                 type="text"
                                 disabled={!isEditing}
                                 value={formData.invoicePrefix || ''}
                                 onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                                 className={`flex-1 bg-transparent font-bold text-gray-800 outline-none placeholder-gray-400 text-sm`}
                                 placeholder="INV-"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>


            {/* RIGHT COLUMN (Forms & Details) */}
            <div className="xl:col-span-2 space-y-6">

               {/* Business Information Section */}
               <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                     <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Building size={22} /></div>
                     <div>
                        <h2 className="text-xl font-bold text-gray-800">Business Details</h2>
                        <p className="text-sm text-gray-500 font-medium">Your official business information</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                        <FormLabel text="Business Name" className="block text-sm font-bold text-gray-700 mb-1.5" />
                        <input type="text" disabled={!isEditing} value={formData.businessName || ''} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className={`w-full px-4 py-3 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border-2 border-gray-100 focus:border-blue-500 shadow-sm' : 'bg-gray-50 border-2 border-transparent text-gray-600'}`} placeholder="Enter your business name" />
                     </div>
                     <div className="md:col-span-2">
                        <FormLabel text="GSTIN" className="block text-sm font-bold text-gray-700 mb-1.5" />
                        <input type="text" disabled={!isEditing} value={formData.gstin || ''} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} className={`w-full px-4 py-3 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border-2 border-gray-100 focus:border-blue-500 shadow-sm' : 'bg-gray-50 border-2 border-transparent text-gray-600'}`} placeholder="GST Identification Number" />
                     </div>
                     <div className="md:col-span-2">
                        <FormLabel text="Street Address" className="block text-sm font-bold text-gray-700 mb-1.5" />
                        <textarea disabled={!isEditing} rows="2" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`w-full px-4 py-3 rounded-xl text-gray-800 font-medium outline-none transition-all resize-none ${isEditing ? 'bg-white border-2 border-gray-100 focus:border-blue-500 shadow-sm' : 'bg-gray-50 border-2 border-transparent text-gray-600'}`} placeholder="Full street address"></textarea>
                     </div>
                     <div>
                        <FormLabel text="City" className="block text-sm font-bold text-gray-700 mb-1.5" />
                        <input type="text" disabled={!isEditing} value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={`w-full px-4 py-3 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border-2 border-gray-100 focus:border-blue-500 shadow-sm' : 'bg-gray-50 border-2 border-transparent text-gray-600'}`} />
                     </div>
                     <div>
                        <FormLabel text="State" className="block text-sm font-bold text-gray-700 mb-1.5" />
                        <input type="text" disabled={!isEditing} value={formData.state || ''} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={`w-full px-4 py-3 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border-2 border-gray-100 focus:border-blue-500 shadow-sm' : 'bg-gray-50 border-2 border-transparent text-gray-600'}`} />
                     </div>
                     <div>
                        <FormLabel text="Pincode" className="block text-sm font-bold text-gray-700 mb-1.5" />
                        <input type="text" disabled={!isEditing} value={formData.pincode || ''} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className={`w-full px-4 py-3 rounded-xl text-gray-800 font-medium outline-none transition-all ${isEditing ? 'bg-white border-2 border-gray-100 focus:border-blue-500 shadow-sm' : 'bg-gray-50 border-2 border-transparent text-gray-600'}`} />
                     </div>
                  </div>
               </div>

               {/* Documents & Banking Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Documents (Originals & Signatures) */}
                  <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><FileCheck size={20} /></div>
                        <h2 className="text-lg font-bold text-gray-800">Documents</h2>
                     </div>

                     <div className="space-y-6">
                        {/* Signature */}
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group transition-all hover:border-gray-200">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Authorized Signature</h4>
                              <button
                                 onClick={() => setUploadModalType('signature')}
                                 className="p-1.5 bg-white text-gray-600 rounded-lg shadow-sm border border-gray-100 hover:text-blue-600 hover:border-blue-100 transition-all"
                                 title="Update Signature"
                              >
                                 <Edit2 size={14} />
                              </button>
                           </div>
                           <div className="h-24 w-full bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                              {hasImage(formData.signatureUrl) ? (
                                 <img src={formData.signatureUrl} alt="Signature" className="h-full object-contain" />
                              ) : (
                                 <span className="text-xs text-gray-400 font-medium">No signature uploaded</span>
                              )}
                           </div>
                        </div>

                        {/* Stamp */}
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group transition-all hover:border-gray-200">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Business Stamp</h4>
                              <button
                                 onClick={() => setUploadModalType('stamp')}
                                 className="p-1.5 bg-white text-gray-600 rounded-lg shadow-sm border border-gray-100 hover:text-blue-600 hover:border-blue-100 transition-all"
                                 title="Update Stamp"
                              >
                                 <Edit2 size={14} />
                              </button>
                           </div>
                           <div className="h-24 w-full bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                              {hasImage(formData.stampUrl) ? (
                                 <img src={formData.stampUrl} alt="Stamp" className="h-full object-contain" />
                              ) : (
                                 <span className="text-xs text-gray-400 font-medium">No stamp uploaded</span>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Banking Details */}
                  <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><CreditCard size={20} /></div>
                        <h2 className="text-lg font-bold text-gray-800">Banking</h2>
                     </div>

                     <div className="space-y-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">UPI ID</label>
                           <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                              <input
                                 type="text"
                                 disabled={!isEditing}
                                 value={formData.upiId || ''}
                                 onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                 className={`flex-1 bg-transparent font-mono font-medium text-gray-800 outline-none ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`}
                                 placeholder="Enter UPI ID"
                              />
                           </div>
                        </div>

                        <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl shadow-gray-300 mt-4 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                           <div className="flex justify-between items-start mb-6 relative z-10">
                              <Landmark size={24} className="opacity-80" />
                              <span className="text-[10px] bg-white/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Primary</span>
                           </div>
                           <div className="space-y-4 relative z-10">
                              <div>
                                 <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Account Holder</p>
                                 <input type="text" disabled={!isEditing} value={formData.accountName || ''} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} className={`bg-transparent w-full text-white font-medium outline-none placeholder-gray-600 ${isEditing ? 'border-b border-gray-600 focus:border-blue-400' : ''}`} placeholder="Holder Name" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Account No.</p>
                                    <input type="text" disabled={!isEditing} value={formData.accountNumber || ''} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} className={`bg-transparent w-full text-white font-mono outline-none placeholder-gray-600 ${isEditing ? 'border-b border-gray-600 focus:border-blue-400' : ''}`} placeholder="****" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">IFSC</p>
                                    <input type="text" disabled={!isEditing} value={formData.ifsc || ''} onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })} className={`bg-transparent w-full text-white font-mono uppercase outline-none placeholder-gray-600 ${isEditing ? 'border-b border-gray-600 focus:border-blue-400' : ''}`} placeholder="CODE" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Security Card (Short) */}
               <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Shield size={20} /></div>
                     <div>
                        <h3 className="text-sm font-bold text-gray-800">Account Security</h3>
                        <p className="text-xs text-gray-500 font-medium">Protect your account with a strong password.</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setIsChangePassModalOpen(true)}
                     className="px-5 py-2.5 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm"
                  >
                     Change Password
                  </button>
               </div>

            </div>
         </div>


         {/* --- UPLOAD MODAL --- */}
         {uploadModalType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
                        Update {uploadModalType === 'profile-photo' ? 'Photo' : uploadModalType}
                     </h3>
                     <button onClick={() => setUploadModalType(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="p-8">
                     <ImageUploader
                        imageType={uploadModalType}
                        currentImageUrl={
                           uploadModalType === 'profile-photo' ? formData.profilePicUrl :
                              uploadModalType === 'signature' ? formData.signatureUrl :
                                 formData.stampUrl
                        }
                        onUploadSuccess={(data) => {
                           setFormData(prev => ({
                              ...prev,
                              profilePicUrl: data.profilePicUrl || prev.profilePicUrl,
                              signatureUrl: data.signatureUrl || prev.signatureUrl,
                              stampUrl: data.stampUrl || prev.stampUrl
                           }));
                           toast.success('Image updated successfully!');
                           setUploadModalType(null);
                        }}
                        onUploadError={(error) => toast.error(error)}
                     />
                  </div>
               </div>
            </div>
         )}


         {/* --- VERIFY PASSWORD MODAL --- */}
         {isVerifyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-8">
                  <div className="flex justify-center mb-6">
                     <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><AlertTriangle size={32} /></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Security Check</h3>
                  <p className="text-sm text-gray-500 font-medium text-center mb-8">Please enter your password to confirm these changes.</p>

                  <input type="password" value={verifyPasswordInput} onChange={(e) => setVerifyPasswordInput(e.target.value)} className="w-full px-5 py-4 mb-6 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl text-gray-800 font-bold outline-none transition-all" placeholder="Enter your password" />

                  <div className="flex gap-3">
                     <button onClick={() => setIsVerifyModalOpen(false)} className="flex-1 py-3.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                     <button onClick={commitSave} className="flex-1 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">Confirm & Save</button>
                  </div>
               </div>
            </div>
         )}

         {/* --- CHANGE PASSWORD MODAL --- */}
         {isChangePassModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Change Password</h3>
                     <button onClick={() => setIsChangePassModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                  <div className="p-8 space-y-4">
                     <input type="password" placeholder="Current Password" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-200 rounded-xl outline-none font-medium text-gray-800 transition-all" />
                     <input type="password" placeholder="New Password" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-200 rounded-xl outline-none font-medium text-gray-800 transition-all" />
                     <input type="password" placeholder="Confirm New Password" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-gray-200 rounded-xl outline-none font-medium text-gray-800 transition-all" />
                  </div>
                  <div className="p-8 pt-0 flex gap-3">
                     <button onClick={() => setIsChangePassModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">Cancel</button>
                     <button onClick={handleChangePassword} className="flex-1 py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg">Update Password</button>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default Profile;