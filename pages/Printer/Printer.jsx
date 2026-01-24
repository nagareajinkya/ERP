import React, { useState } from 'react';
import { 
  Printer as PrinterIcon, Usb, Bluetooth, Monitor, 
  Layout, Type, Table as TableIcon, ShieldCheck, 
  Image as ImageIcon, MapPin, Phone, Hash, 
  FileText, Download, Play, X, Check, Tag,
  Instagram, MessageCircle, Save, Scissors, Percent
} from 'lucide-react';
import {billItems} from '../../src/data/printerData'

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
    showHSN: true,
    showDiscount: true,
    showUnitPrice: true,
    detailedGST: true,
    showCurrencySymbol: true, 
    showSignature: true,
    terms: 'Goods once sold will not be taken back.',
    instagram: 'gurudev_mart',
    whatsapp: '9876543210'
  });



  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Print Configuration</h1>
          <p className="text-sm text-gray-500 font-medium">Manage printer hardware and invoice design.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all hover:bg-green-700 active:scale-95">
          <Save size={18} /> SAVE SETTINGS
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 space-y-6">
          {/* TAB NAVIGATION */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <button onClick={() => setActiveSettingsTab('hardware')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeSettingsTab === 'hardware' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}>
              <Usb size={16}/> Hardware
            </button>
            <button onClick={() => setActiveSettingsTab('branding')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeSettingsTab === 'branding' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}>
              <ImageIcon size={16}/> Branding
            </button>
            <button onClick={() => setActiveSettingsTab('columns')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeSettingsTab === 'columns' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}>
              <TableIcon size={16}/> Row & Columns
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
                      <button onClick={()=>setPrintFormat('thermal')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${printFormat === 'thermal' ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100' : 'text-gray-400'}`}>Thermal Printer</button>
                      <button onClick={()=>setPrintFormat('standard')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${printFormat === 'standard' ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100' : 'text-gray-400'}`}>Inkjet / Laser</button>
                    </div>

                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 pt-4">2. Page Size</h3>
                    {printFormat === 'thermal' ? (
                      <div className="flex bg-gray-50 p-1 rounded-2xl">
                        <button onClick={()=>setPaperSize('58mm')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${paperSize === '58mm' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>2" (58mm)</button>
                        <button onClick={()=>setPaperSize('80mm')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${paperSize === '80mm' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>3" (80mm)</button>
                      </div>
                    ) : (
                      <div className="flex bg-gray-50 p-1 rounded-2xl">
                        <button onClick={()=>setStandardSize('A4')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${standardSize === 'A4' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>A4 Size</button>
                        <button onClick={()=>setStandardSize('A5')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${standardSize === 'A5' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>A5 Size</button>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100 flex flex-col items-center justify-center text-center">
                    <PrinterIcon size={48} className="text-blue-300 mb-4"/>
                    <h4 className="font-bold text-blue-800 text-sm">Printer Readiness</h4>
                    <p className="text-[10px] text-blue-400 mt-1 mb-6">Device: {printFormat === 'thermal' ? 'POS-80-Series' : 'System Default'}</p>
                    <button className="w-full py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 uppercase tracking-tighter text-xs">Test Page</button>
                  </div>
                </div>
              </div>
            )}

            {/* BRANDING SETTINGS */}
            {activeSettingsTab === 'branding' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Header Title</label>
                    <input type="text" value={layout.invoiceTitle} onChange={e=>setLayout({...layout, invoiceTitle: e.target.value})} className="w-full mt-1.5 p-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo Placement</label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <button onClick={()=>setLayout({...layout, logoPosition: 'left'})} className={`py-3 rounded-xl font-bold text-xs ${layout.logoPosition === 'left' ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400'}`}>Left</button>
                      <button onClick={()=>setLayout({...layout, logoPosition: 'center'})} className={`py-3 rounded-xl font-bold text-xs ${layout.logoPosition === 'center' ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400'}`}>Center</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Header Details</h3>
                    {[ 
                      {l: 'Store Logo', k: 'showLogo'}, 
                      {l: 'Print GSTIN', k: 'showHeaderGST'}, 
                      {l: 'Show Phone No', k: 'showHeaderPhone'}, 
                      {l: 'Store Address', k: 'showHeaderAddress'} 
                    ].map(i => (
                      <div key={i.k} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                        <span className="text-sm font-bold text-gray-700">{i.l}</span>
                        <button onClick={()=>setLayout({...layout, [i.k]: !layout[i.k]})} className={`w-10 h-5 rounded-full relative transition-all ${layout[i.k] ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${layout[i.k] ? 'translate-x-5' : ''}`}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">T&C / Footer Note</label>
                      <textarea value={layout.terms} onChange={e=>setLayout({...layout, terms: e.target.value})} className="w-full mt-1.5 p-4 bg-gray-50 rounded-xl font-bold text-xs h-28 resize-none outline-none focus:bg-white focus:border-blue-500 border-2 border-transparent" />
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-gray-700">Signature Area</span>
                      <button onClick={()=>setLayout({...layout, showSignature: !layout.showSignature})} className={`w-10 h-5 rounded-full relative transition-all ${layout.showSignature ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${layout.showSignature ? 'translate-x-5' : ''}`}/></button>
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
                    { l: 'HSN/SAC Code', k: 'showHSN', i: FileText },
                    { l: 'Item Discount', k: 'showDiscount', i: Percent },
                    { l: 'Unit Price', k: 'showUnitPrice', i: IndianRupee },
                    { l: 'Tax Details Table', k: 'detailedGST', i: ShieldCheck },
                    { l: 'Indian Rupee Symbol', k: 'showCurrencySymbol', i: IndianRupee },
                  ].map(c => (
                    <div key={c.k} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:border-blue-100 border-2 border-transparent transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><c.i size={16}/></div>
                        <span className="text-sm font-bold text-gray-700">{c.l}</span>
                      </div>
                      <button onClick={()=>setLayout({...layout, [c.k]: !layout[c.k]})} className={`w-12 h-6 rounded-full relative transition-all ${layout[c.k] ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${layout[c.k] ? 'translate-x-6' : ''}`}/></button>
                    </div>
                  ))}
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
                 <h2 className={`${printFormat === 'standard' ? 'text-xl' : 'text-xs'} font-black uppercase text-gray-800`}>Shri Gurudev Mart</h2>
                 <div className="opacity-70 leading-tight">
                    {layout.showHeaderAddress && <p>123 Main Street, Sector 4, Pune - 411001</p>}
                    {layout.showHeaderPhone && <p>Mobile: +91 98765 43210</p>}
                    {layout.showHeaderGST && <p className="font-bold mt-1 text-gray-800">GSTIN: 27AABCU9603R1ZM</p>}
                 </div>
              </div>

              {/* Title Section */}
              <div className={`border-y border-dashed border-gray-300 py-2 mb-4 flex justify-between font-black uppercase text-gray-700`}>
                 <span>{layout.invoiceTitle}</span>
                 <span>#INV-001024</span>
              </div>

              {/* Items Table */}
              <table className="w-full mb-6 border-collapse">
                 <thead className="border-b border-gray-200">
                    <tr className="text-[9px] text-gray-400 uppercase">
                       {layout.showSerialNo && <th className="text-left py-1">#</th>}
                       <th className="text-left py-1">Item Description</th>
                       {layout.showHSN && <th className="text-left py-1">HSN</th>}
                       <th className="text-right py-1">Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {billItems.map(item => (
                       <tr key={item.sn}>
                          {layout.showSerialNo && <td className="py-3 align-top">{item.sn}</td>}
                          <td className="py-3">
                             <p className="font-bold text-gray-800">{item.name}</p>
                             {layout.showDiscount && <span className="text-[8px] text-red-500">Discount Applied: {item.disc}</span>}
                          </td>
                          {layout.showHSN && <td className="py-3 align-top opacity-60">{item.hsn}</td>}
                          <td className="py-3 text-right align-top font-bold text-gray-800">{layout.showCurrencySymbol ? '₹' : 'INR '}{item.total.toFixed(2)}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              {/* Totals Section */}
              <div className={`space-y-1.5 border-t border-gray-100 pt-4 mb-8`}>
                 <div className="flex justify-between"><span>Sub-Total:</span><span className="font-bold text-gray-700">₹687.50</span></div>
                 {layout.detailedGST ? (
                    <div className="text-[8px] opacity-60 pl-3 italic space-y-0.5">
                       <div className="flex justify-between"><span>CGST (9%):</span><span>₹61.80</span></div>
                       <div className="flex justify-between"><span>SGST (9%):</span><span>₹61.80</span></div>
                    </div>
                 ) : <div className="flex justify-between"><span>Tax Amount:</span><span>₹123.60</span></div>}
                 <div className="flex justify-between text-base font-black pt-3 border-t border-dashed border-gray-200 text-gray-900">
                    <span>GRAND TOTAL:</span>
                    <span>{layout.showCurrencySymbol ? '₹' : ''} 811.10</span>
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

                 <div className="flex justify-center gap-4 opacity-30 mt-8">
                    <Instagram size={12}/> <MessageCircle size={12}/> <p className="text-[8px] font-bold">Follow @gurudev_mart</p>
                 </div>
              </div>

              {/* Thermal Cut Indicator */}
              {printFormat === 'thermal' && (
                 <div className="absolute -bottom-6 left-0 right-0 flex items-center gap-2 opacity-10">
                    <div className="flex-1 border-t border-dashed border-gray-400"></div>
                    <Scissors size={14}/>
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