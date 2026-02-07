import React, { useState, useEffect } from 'react';
import {
  Printer as PrinterIcon, Usb, Bluetooth, Monitor,
  Layout, Type, Table as TableIcon, ShieldCheck,
  Image as ImageIcon, MapPin, Phone, Hash,
  FileText, Download, Play, X, Check, Tag,
  Instagram, MessageCircle, Save, Scissors, Percent, Loader2, Globe
} from 'lucide-react';
import FormLabel from '../../components/common/FormLabel';
import { toast } from 'react-toastify';
import api from '../../src/api';

// --- 1. CUSTOM INDIAN RUPEE ICON (Defined first to avoid ReferenceError) ---
const IndianRupee = ({ size = 20, className = "" }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className={className}
  >
    <path d="M6 3h12" /><path d="M6 8h12" />
    <path d="m6 13 8.5 8" /><path d="M6 13h3" />
    <path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);

const Printer = () => {
  // --- STATE ---
  const [activeSettingsTab, setActiveSettingsTab] = useState('hardware');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [printFormat, setPrintFormat] = useState('thermal'); // 'thermal' or 'standard'
  const [paperSize, setPaperSize] = useState('80mm'); // For thermal
  const [standardSize, setStandardSize] = useState('A4'); // For standard

  const [layout, setLayout] = useState({
    invoiceTitle: 'Tax Invoice',
    showLogo: true,
    logoPosition: 'center',
    showHeaderGST: true,
    showHeaderPhone: true,
    showHeaderAddress: true,
    showSerialNo: true,
    showDiscount: true,
    showUnitPrice: true,
    detailedGST: true,
    showCurrencySymbol: true,
    showBillDiscount: false, // New Field
    showSignature: true,
    terms: 'Goods once sold will not be taken back.',
    showWebsite: false,
    websiteUrl: '',
    showInstagram: false,
    instagramHandle: ''
  });

  const [businessProfile, setBusinessProfile] = useState(null);

  // Fetch settings & user profile on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel Fetch: Settings + User Profile
        const [settingsRes, profileRes] = await Promise.all([
          api.get('/smart-ops/printer-settings'),
          api.get('/auth/profile')
        ]);

        // Data Handling - Settings
        if (settingsRes.data) {
          if (settingsRes.data.printFormat) setPrintFormat(settingsRes.data.printFormat);
          if (settingsRes.data.paperSize) setPaperSize(settingsRes.data.paperSize);
          if (settingsRes.data.standardSize) setStandardSize(settingsRes.data.standardSize);
          if (settingsRes.data.layout) setLayout(prev => ({ ...prev, ...settingsRes.data.layout }));
        }

        // Data Handling - Profile
        if (profileRes.data) {
          // Map ProfileDto flat structure to businessProfile state
          const profile = {
            businessName: profileRes.data.businessName,
            addressStreet: profileRes.data.address,
            addressCity: profileRes.data.city,
            addressState: profileRes.data.state,
            addressPincode: profileRes.data.pincode,
            phoneNumber: profileRes.data.phone,
            gstin: profileRes.data.gstin
          };
          setBusinessProfile(profile);

          // Auto-disable toggles if data is missing
          setLayout(prev => ({
            ...prev,
            showHeaderGST: profile.gstin ? prev.showHeaderGST : false,
            showHeaderAddress: (profile.addressStreet || profile.addressCity) ? prev.showHeaderAddress : false,
            showHeaderPhone: profile.phoneNumber ? prev.showHeaderPhone : false
          }));
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        printFormat,
        paperSize,
        standardSize,
        layout
      };

      await api.put('/smart-ops/printer-settings', payload);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving printer settings:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // --- TEST PRINT LOGIC ---
  const handleTestPrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow) {
      toast.warning("Please allow popups to use the test print feature.");
      return;
    }

    // Styles for Thermal/Standard
    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
        @media print {
            @page { margin: 0; size: ${printFormat === 'thermal' ? (paperSize === '58mm' ? '58mm' : '80mm') : standardSize}; }
            body { -webkit-print-color-adjust: exact; }
        }
        .container { 
            width: ${printFormat === 'thermal' ? (paperSize === '58mm' ? '58mm' : '80mm') : '100%'};
            padding: ${printFormat === 'thermal' ? '10px' : '40px'};
            box-sizing: border-box;
        }
        .title { font-weight: 900; text-transform: uppercase; font-size: ${printFormat === 'thermal' ? '14px' : '24px'}; text-align: center; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .text-xs { font-size: 10px; }
        .text-sm { font-size: 12px; }
        .font-bold { font-weight: 700; }
        .border-b { border-bottom: 1px dashed #ccc; }
        .border-t { border-top: 1px dashed #ccc; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 4px 0; font-size: ${printFormat === 'thermal' ? '10px' : '12px'}; }
        th { text-transform: uppercase; color: #666; font-size: 9px; }
      </style>
    `;

    // Content from Preview (Simplified for Print)
    const content = `
      <div class="container">
        <div class="text-center mb-4">
             ${layout.showLogo ? '<div style="font-weight:900; font-size:12px; margin-bottom:5px;">[LOGO]</div>' : ''}
             <div class="title">${businessProfile?.businessName || 'Business Name'}</div>
             <div class="text-xs">
                 ${layout.showHeaderAddress ? (businessProfile?.addressStreet || businessProfile?.addressCity ? [businessProfile?.addressStreet, businessProfile?.addressCity].filter(Boolean).join(', ') : '') : ''}<br/>
                 ${layout.showHeaderPhone && businessProfile?.phoneNumber ? `Mobile: ${businessProfile.phoneNumber}<br/>` : ''}
                 ${layout.showHeaderGST && businessProfile?.gstin ? `GSTIN: ${businessProfile.gstin}` : ''}
             </div>
        </div>

        <div class="border-t border-b py-2 text-center font-bold text-xs uppercase">
            ${layout.invoiceTitle} #TEST-001
        </div>

        <div style="padding: 20px 0; text-align: center; font-size: 12px;">
            <p><strong>THIS IS A TEST PRINT</strong></p>
            <p>If you can read this, your printer is configured correctly.</p>
            <p>Format: ${printFormat.toUpperCase()} - ${printFormat === 'thermal' ? paperSize : standardSize}</p>
        </div>

        <div class="border-t py-2 text-center text-xs">
            ${layout.terms}
        </div>
      </div>
    `;

    printWindow.document.write(`<html><head><title>Test Print</title>${styles}</head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();

    // Auto print and close
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };



  // --- PREVIEW DATA CALCULATION ---
  // Mock Items with Tax Inclusive Logic
  const previewItems = [
    { sn: 1, name: 'Product 1', qty: 2, total: 200 }, // Price = 100
    { sn: 2, name: 'Product 2', qty: 1, total: 150 }, // Price = 150
    { sn: 3, name: 'Product 3', qty: 5, total: 50 },  // Price = 10
  ];

  const subTotal = previewItems.reduce((acc, item) => acc + item.total, 0); // 400
  const billDiscount = layout.showBillDiscount ? 50 : 0; // Mock Discount
  const grandTotal = subTotal - billDiscount; // 350

  // Reverse Tax Calculation (18% inclusive)
  // Base = Total / 1.18
  const taxableValue = grandTotal / 1.18;
  const taxAmount = grandTotal - taxableValue;
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Helper to check missing data
  const isDataMissing = (key) => {
    if (!businessProfile) return false;
    if (key === 'showHeaderGST') return !businessProfile.gstin;
    if (key === 'showHeaderAddress') return !businessProfile.addressStreet && !businessProfile.addressCity;
    if (key === 'showHeaderPhone') return !businessProfile.phoneNumber;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Print Configuration</h1>
          <p className="text-sm text-gray-500 font-medium">Manage printer hardware and invoice design.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all hover:bg-green-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        <div className="xl:col-span-2 space-y-6">
          {/* TAB NAVIGATION */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <button onClick={() => setActiveSettingsTab('hardware')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeSettingsTab === 'hardware' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}>
              <Usb size={16} /> Hardware
            </button>
            <button onClick={() => setActiveSettingsTab('branding')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeSettingsTab === 'branding' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}>
              <ImageIcon size={16} /> Branding
            </button>
            <button onClick={() => setActiveSettingsTab('columns')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeSettingsTab === 'columns' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}>
              <TableIcon size={16} /> Row & Columns
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 min-h-[550px]">

            {/* HARDWARE SETTINGS */}
            {activeSettingsTab === 'hardware' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">1. Format Type</h3>
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                      <button onClick={() => setPrintFormat('thermal')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${printFormat === 'thermal' ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100' : 'text-gray-400'}`}>Thermal Printer</button>
                      <button onClick={() => setPrintFormat('standard')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${printFormat === 'standard' ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100' : 'text-gray-400'}`}>Inkjet / Laser</button>
                    </div>

                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 pt-4">2. Page Size</h3>
                    {printFormat === 'thermal' ? (
                      <div className="flex bg-gray-50 p-1 rounded-2xl">
                        <button onClick={() => setPaperSize('58mm')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${paperSize === '58mm' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>2" (58mm)</button>
                        <button onClick={() => setPaperSize('80mm')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${paperSize === '80mm' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>3" (80mm)</button>
                      </div>
                    ) : (
                      <div className="flex bg-gray-50 p-1 rounded-2xl">
                        <button onClick={() => setStandardSize('A4')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${standardSize === 'A4' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>A4 Size</button>
                        <button onClick={() => setStandardSize('A5')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${standardSize === 'A5' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>A5 Size</button>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100 flex flex-col items-center justify-center text-center">
                    <PrinterIcon size={48} className="text-blue-300 mb-4" />
                    <h4 className="font-bold text-blue-800 text-sm">Printer Readiness</h4>
                    <p className="text-[10px] text-blue-400 mt-1 mb-6">Device: {printFormat === 'thermal' ? 'POS-80-Series' : 'System Default'}</p>
                    <button
                      onClick={handleTestPrint}
                      className="w-full py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 uppercase tracking-tighter text-xs active:scale-95 transition-all hover:bg-blue-700"
                    >
                      Test Page
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BRANDING SETTINGS */}
            {activeSettingsTab === 'branding' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormLabel text="Header Title" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1" />
                    <input type="text" value={layout.invoiceTitle} onChange={e => setLayout({ ...layout, invoiceTitle: e.target.value })} className="w-full mt-1.5 p-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl font-bold outline-none" />
                  </div>
                  <div>
                    <FormLabel text="Logo Placement" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1" />
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <button onClick={() => setLayout({ ...layout, logoPosition: 'left' })} className={`py-3 rounded-xl font-bold text-xs ${layout.logoPosition === 'left' ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400'}`}>Left</button>
                      <button onClick={() => setLayout({ ...layout, logoPosition: 'center' })} className={`py-3 rounded-xl font-bold text-xs ${layout.logoPosition === 'center' ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400'}`}>Center</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Header Details</h3>
                    {[
                      { l: 'Store Logo', k: 'showLogo' },
                      { l: 'Print GSTIN', k: 'showHeaderGST' },
                      { l: 'Show Phone No', k: 'showHeaderPhone' },
                      { l: 'Store Address', k: 'showHeaderAddress' }
                    ].map(i => {
                      const missing = isDataMissing(i.k);
                      return (
                        <div key={i.k} className={`flex flex-col p-3.5 bg-gray-50 rounded-xl transition-all ${missing ? 'opacity-70 grayscale' : ''}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">{i.l}</span>
                            <button
                              onClick={() => {
                                if (missing) return;
                                setLayout({ ...layout, [i.k]: !layout[i.k] })
                              }}
                              disabled={missing}
                              className={`w-10 h-5 rounded-full relative transition-all ${layout[i.k] && !missing ? 'bg-green-500' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                              <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${layout[i.k] && !missing ? 'translate-x-5' : ''}`} />
                            </button>
                          </div>
                          {missing && (
                            <p className="text-[10px] text-red-500 font-bold mt-1">
                              * Not updated in profile
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <FormLabel text="T&C / Footer Note" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1" />
                      <textarea value={layout.terms} onChange={e => setLayout({ ...layout, terms: e.target.value })} className="w-full mt-1.5 p-4 bg-gray-50 rounded-xl font-bold text-xs h-28 resize-none outline-none focus:bg-white focus:border-blue-500 border-2 border-transparent" />
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-gray-700">Signature Area</span>
                      <button onClick={() => setLayout({ ...layout, showSignature: !layout.showSignature })} className={`w-10 h-5 rounded-full relative transition-all ${layout.showSignature ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${layout.showSignature ? 'translate-x-5' : ''}`} /></button>
                    </div>

                    {/* FOOTER ICONS CUSTOMIZATION */}
                    <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Footer Links</h3>

                      {/* Website */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-2"><Globe size={14} /> Show Website</span>
                          <button onClick={() => setLayout({ ...layout, showWebsite: !layout.showWebsite })} className={`w-8 h-4 rounded-full relative transition-all ${layout.showWebsite ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${layout.showWebsite ? 'translate-x-4' : ''}`} /></button>
                        </div>
                        {layout.showWebsite && (
                          <input type="text" placeholder="www.yourwebsite.com" value={layout.websiteUrl || ''} onChange={e => setLayout({ ...layout, websiteUrl: e.target.value })} className="w-full p-2 text-xs rounded-lg border border-gray-200 outline-none focus:border-blue-500" />
                        )}
                      </div>

                      {/* Instagram */}
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-2"><Instagram size={14} /> Show Instagram</span>
                          <button onClick={() => setLayout({ ...layout, showInstagram: !layout.showInstagram })} className={`w-8 h-4 rounded-full relative transition-all ${layout.showInstagram ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${layout.showInstagram ? 'translate-x-4' : ''}`} /></button>
                        </div>
                        {layout.showInstagram && (
                          <input type="text" placeholder="@yourgram" value={layout.instagramHandle || ''} onChange={e => setLayout({ ...layout, instagramHandle: e.target.value })} className="w-full p-2 text-xs rounded-lg border border-gray-200 outline-none focus:border-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COLUMN SETTINGS */}
            {activeSettingsTab === 'columns' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Invoice Column Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { l: 'Row Index (#)', k: 'showSerialNo', i: Hash },
                    { l: 'Product', k: 'showProductName', i: Tag }, // No logic change needed, just visual if hidden, though usually always shown
                    // removed HSN
                    { l: 'Show Quantity', k: 'showQty', i: Hash }, // New or just assumed
                    { l: 'Item Discount', k: 'showDiscount', i: Percent },
                    { l: 'Unit Price', k: 'showUnitPrice', i: IndianRupee },
                    { l: 'Bill Discount', k: 'showBillDiscount', i: Scissors }, // New
                    { l: 'Tax Details Table', k: 'detailedGST', i: ShieldCheck },
                    { l: 'Indian Rupee Symbol', k: 'showCurrencySymbol', i: IndianRupee },
                  ].map(c => {
                    // Virtual fields handling if needed, but for now map directly to layout keys
                    // We need to ensure new keys exist in layout state if not added yet.
                    if (c.k === 'showProductName' || c.k === 'showQty') return null; // Skip non-toggleable or implicit for now based on req
                    return (
                      <div key={c.k} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:border-blue-100 border-2 border-transparent transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><c.i size={16} /></div>
                          <span className="text-sm font-bold text-gray-700">{c.l}</span>
                        </div>
                        <button onClick={() => setLayout({ ...layout, [c.k]: !layout[c.k] })} className={`w-12 h-6 rounded-full relative transition-all ${layout[c.k] ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${layout[c.k] ? 'translate-x-6' : ''}`} /></button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW (DYNAMIC BASED ON FORMAT) */}
        <div className="xl:col-span-1">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest text-center">Live {printFormat.toUpperCase()} Preview</p>

          {/* Preview Container */}
          <div className={`bg-white shadow-2xl mx-auto overflow-hidden transition-all duration-500 relative
             ${printFormat === 'thermal' ? 'w-[320px] rounded-sm min-h-[600px] p-6 text-[10px] border-t-[10px] border-gray-800' : 'w-full rounded-2xl min-h-[600px] p-10 text-[11px] border border-gray-200'}
           `}>

            {/* Header */}
            <div className={`flex flex-col mb-6 ${layout.logoPosition === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
              {layout.showLogo && <div className={`w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200 font-bold text-gray-300 uppercase mb-3 ${printFormat === 'standard' ? 'w-16 h-16' : ''}`}>Logo</div>}
              <h2 className={`${printFormat === 'standard' ? 'text-xl' : 'text-xs'} font-black uppercase text-gray-800`}>{businessProfile?.businessName || 'Your Business Name'}</h2>
              <div className="opacity-70 leading-tight">
                {layout.showHeaderAddress && (businessProfile?.addressStreet || businessProfile?.addressCity) && <p>{[businessProfile?.addressStreet, businessProfile?.addressCity, businessProfile?.addressState, businessProfile?.addressPincode].filter(Boolean).join(', ')}</p>}
                {layout.showHeaderPhone && businessProfile?.phoneNumber && <p>Mobile: {businessProfile.phoneNumber}</p>}
                {layout.showHeaderGST && businessProfile?.gstin && <p className="font-bold mt-1 text-gray-800">GSTIN: {businessProfile.gstin}</p>}
              </div>
            </div>

            {/* Title Section */}
            <div className={`border-y border-dashed border-gray-300 py-2 mb-4 flex justify-between font-black uppercase text-gray-700`}>
              <span>{layout.invoiceTitle}</span>
              <span>#INV-001</span>
            </div>

            {/* Items Table */}
            <table className="w-full mb-6 border-collapse">
              <thead className="border-b border-gray-200">
                <tr className="text-[9px] text-gray-400 uppercase">
                  {layout.showSerialNo && <th className="text-left py-1">#</th>}
                  <th className="text-left py-1">Product</th>
                  <th className="text-center py-1">Qty</th>
                  {layout.showUnitPrice && <th className="text-right py-1">Price</th>}
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {previewItems.map(item => (
                  <tr key={item.sn}>
                    {layout.showSerialNo && <td className="py-3 align-top">{item.sn}</td>}
                    <td className="py-3">
                      <p className="font-bold text-gray-800">{item.name}</p>
                      {layout.showDiscount && <span className="text-[8px] text-red-500">Disc: 10%</span>}
                    </td>
                    <td className="py-3 text-center align-top">{item.qty}</td>
                    {layout.showUnitPrice && <td className="py-3 text-right align-top opacity-60">{(item.total / item.qty).toFixed(2)}</td>}
                    <td className="py-3 text-right align-top font-bold text-gray-800">{layout.showCurrencySymbol ? '₹' : ''}{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className={`space-y-1.5 border-t border-gray-100 pt-4 mb-8`}>
              <div className="flex justify-between"><span>Sub-Total:</span><span className="font-bold text-gray-700">₹{subTotal.toFixed(2)}</span></div>

              {layout.showBillDiscount && (
                <div className="flex justify-between text-green-600"><span>Bill Discount:</span><span>-₹{billDiscount.toFixed(2)}</span></div>
              )}

              {layout.detailedGST ? (
                <div className="text-[8px] opacity-60 pl-3 italic space-y-0.5 border-t border-dashed border-gray-100 pt-1 mt-1">
                  <div className="flex justify-between"><span>Taxable Value:</span><span>₹{taxableValue.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>CGST (9%):</span><span>₹{cgst.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>SGST (9%):</span><span>₹{sgst.toFixed(2)}</span></div>
                </div>
              ) : (
                <div className="flex justify-between text-[9px]"><span>Tax (Included):</span><span>₹{taxAmount.toFixed(2)}</span></div>
              )}

              <div className="flex justify-between text-base font-black pt-3 border-t border-dashed border-gray-200 text-gray-900">
                <span>GRAND TOTAL:</span>
                <span>{layout.showCurrencySymbol ? '₹' : ''} {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4">
              <p className="text-[8px] italic leading-relaxed text-gray-400">Note: {layout.terms}</p>

              {layout.showSignature && (
                <div className="mt-12 pt-2 border-t border-gray-200 text-center">
                  <p className="font-bold uppercase text-[9px] text-gray-800">Authorized Signatory</p>
                </div>
              )}

              {/* Social / Website Links */}
              <div className="flex justify-center gap-4 opacity-40 mt-8 pt-4 border-t border-gray-100">
                {layout.showWebsite && layout.websiteUrl && (
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-600">
                    <Globe size={10} /> {layout.websiteUrl}
                  </div>
                )}
                {layout.showInstagram && layout.instagramHandle && (
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-600">
                    <Instagram size={10} /> {layout.instagramHandle}
                  </div>
                )}
              </div>
            </div>

            {/* Thermal Cut Indicator */}
            {printFormat === 'thermal' && (
              <div className="absolute -bottom-6 left-0 right-0 flex items-center gap-2 opacity-10">
                <div className="flex-1 border-t border-dashed border-gray-400"></div>
                <Scissors size={14} />
                <div className="flex-1 border-t border-dashed border-gray-400"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Printer;