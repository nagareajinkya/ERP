import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Printer as PrinterIcon, ChevronLeft, Loader2, Scissors, Globe, Instagram } from 'lucide-react';
import api from '../../src/api';
import { toast } from 'react-toastify';

const BillPreview = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const transaction = state?.transaction;

  // State
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [layout, setLayout] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [printFormat, setPrintFormat] = useState('thermal');
  const [paperSize, setPaperSize] = useState('80mm');
  const [standardSize, setStandardSize] = useState('A4');

  // Redirect if no transaction data
  useEffect(() => {
    if (!transaction) {
      navigate('/transactions');
      return;
    }

    // Fetch printer settings & profile
    const fetchData = async () => {
      try {
        const [settingsRes, profileRes] = await Promise.all([
          api.get('/smart-ops/printer-settings'),
          api.get('/auth/profile')
        ]);

        if (settingsRes.data) {
          if (settingsRes.data.printFormat) setPrintFormat(settingsRes.data.printFormat);
          if (settingsRes.data.paperSize) setPaperSize(settingsRes.data.paperSize);
          if (settingsRes.data.standardSize) setStandardSize(settingsRes.data.standardSize);
          if (settingsRes.data.layout) setLayout(settingsRes.data.layout);
        }

        if (profileRes.data) {
          const profile = {
            businessName: profileRes.data.businessName,
            addressStreet: profileRes.data.address,
            addressCity: profileRes.data.city,
            addressState: profileRes.data.state,
            addressPincode: profileRes.data.pincode,
            phoneNumber: profileRes.data.phone,
            gstin: profileRes.data.gstin,
            invoicePrefix: profileRes.data.invoicePrefix,
            profilePicUrl: profileRes.data.profilePicUrl,
            signatureUrl: profileRes.data.signatureUrl,
            stampUrl: profileRes.data.stampUrl,
            alwaysShowPaymentQr: profileRes.data.alwaysShowPaymentQr,
            upiId: profileRes.data.upiId
          };
          setBusinessProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load bill settings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [transaction, navigate]);

  // Calculate totals from transaction
  const calculateTotals = () => {
    const subTotal = transaction?.details?.reduce((acc, item) => acc + (Number(item.total) || 0), 0) || 0;
    const billDiscount = transaction?.discount || 0;
    const grandTotal = subTotal - billDiscount;
    const taxableValue = grandTotal / 1.18;
    const taxAmount = grandTotal - taxableValue;
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;

    return {
      subTotal,
      billDiscount,
      grandTotal,
      taxableValue,
      taxAmount,
      cgst,
      sgst
    };
  };

  const totals = calculateTotals();
  const invoiceNumber = businessProfile?.invoicePrefix
    ? `${businessProfile.invoicePrefix}${transaction?.id || ''}`
    : (transaction?.id || '');

  // Handle Print
  const handlePrint = async () => {
    setPrinting(true);
    try {
      const printWindow = window.open('', '', 'width=600,height=600');
      if (!printWindow) {
        toast.warning('Please allow popups to use the print feature.');
        setPrinting(false);
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

      // Content from Preview
      const content = `
        <div class="container">
          <div class="text-center mb-4">
               ${layout?.showLogo ? '<div style="font-weight:900; font-size:12px; margin-bottom:5px;">[LOGO]</div>' : ''}
               <div class="title">${businessProfile?.businessName || 'Business Name'}</div>
               <div class="text-xs">
                   ${layout?.showHeaderAddress ? (businessProfile?.addressStreet || businessProfile?.addressCity ? [businessProfile?.addressStreet, businessProfile?.addressCity].filter(Boolean).join(', ') : '') : ''}<br/>
                   ${layout?.showHeaderPhone && businessProfile?.phoneNumber ? `Mobile: ${businessProfile.phoneNumber}<br/>` : ''}
                   ${layout?.showHeaderGST && businessProfile?.gstin ? `GSTIN: ${businessProfile.gstin}` : ''}
               </div>
          </div>

            <div class="border-t border-b py-2 text-center font-bold text-xs uppercase">
              ${layout?.invoiceTitle || 'Invoice'} #${invoiceNumber}
            </div>

          <div style="padding: 10px 0; font-size: 10px;">
            <p><strong>Date:</strong> ${new Date(transaction?.date).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${transaction?.party || 'Walk-In'}</p>
          </div>

          <table>
            <thead style="border-bottom: 1px dashed #ccc;">
              <tr style="font-size: 9px; color: #999; text-transform: uppercase;">
                ${layout?.showSerialNo ? '<th style="text-align: left; padding: 4px 0;">#</th>' : ''}
                <th style="text-align: left; padding: 4px 0;">Product</th>
                <th style="text-align: center; padding: 4px 0;">Qty</th>
                ${layout?.showUnitPrice ? '<th style="text-align: right; padding: 4px 0;">Price</th>' : ''}
                <th style="text-align: right; padding: 4px 0;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${transaction?.details?.map((item, idx) => `
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  ${layout?.showSerialNo ? `<td style="padding: 3px 0;">${idx + 1}</td>` : ''}
                  <td style="padding: 3px 0;">
                    <strong>${item.name}</strong><br/>
                  </td>
                  <td style="padding: 3px 0; text-align: center;">${item.qty}</td>
                  ${layout?.showUnitPrice ? `<td style="padding: 3px 0; text-align: right; opacity: 0.7;">₹${(item.rate || 0).toFixed(2)}</td>` : ''}
                  <td style="padding: 3px 0; text-align: right; font-weight: bold;">₹${Number(item.total).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 10px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Sub-Total:</span>
              <strong>₹${totals.subTotal.toFixed(2)}</strong>
            </div>

            ${layout?.showBillDiscount && totals.billDiscount ? `
              <div style="display: flex; justify-content: space-between; color: #16a34a;">
                <span>Bill Discount:</span>
                <span>-₹${totals.billDiscount.toFixed(2)}</span>
              </div>
            ` : ''}

            ${layout?.detailedGST ? `
              <div style="font-size: 8px; opacity: 0.6; padding-left: 12px; border-top: 1px dashed #e5e7eb; padding-top: 4px; margin-top: 4px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Taxable Value:</span>
                  <span>₹${totals.taxableValue.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>CGST (9%):</span>
                  <span>₹${totals.cgst.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>SGST (9%):</span>
                  <span>₹${totals.sgst.toFixed(2)}</span>
                </div>
              </div>
            ` : `
              <div style="display: flex; justify-content: space-between; font-size: 9px;">
                <span>Tax (Included):</span>
                <span>₹${totals.taxAmount.toFixed(2)}</span>
              </div>
            `}

            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; padding-top: 8px; border-top: 1px dashed #ccc; margin-top: 8px;">
              <span>GRAND TOTAL:</span>
              <span>₹${totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style="margin-top: 20px; font-size: 8px;">
            <p style="font-style: italic; color: #999;">Note: ${layout?.terms || 'Goods once sold will not be taken back.'}</p>

            ${layout?.showSignature ? `
              <div style="margin-top: 40px; padding-top: 8px; border-top: 1px solid #ccc; text-align: center;">
                <p style="font-weight: bold; text-transform: uppercase; font-size: 9px;">Authorized Signatory</p>
              </div>
            ` : ''}

            ${layout?.showPaymentQr && businessProfile?.upiId ? `
            <div style="margin-top: 20px; text-align: center; border-top: 1px dashed #ccc; padding-top: 10px;">
              <p style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">SCAN TO PAY</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`upi://pay?pa=${businessProfile.upiId}&pn=${businessProfile.businessName}&tn=InvoicePayment&am=${totals.grandTotal}&cu=INR`)}&size=100x100" style="width: 80px; height: 80px;" />
            </div>
            ` : ''}
          </div>
        </div>
      `;

      printWindow.document.write(`<html><head><title>Bill</title>${styles}</head><body>${content}</body></html>`);
      printWindow.document.close();
      printWindow.focus();

      // Auto print and close
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (err) {
      console.error('Error printing:', err);
      toast.error('Failed to print bill');
    } finally {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/new-sale')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Bill Preview</h1>
            <p className="text-sm text-gray-500 font-medium">Review and print your bill</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold border-2 border-blue-600 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-70"
          >
            {printing ? <Loader2 size={18} className="animate-spin" /> : <PrinterIcon size={18} />}
            {printing ? 'PRINTING...' : 'PRINT'}
          </button>
          <button
            onClick={() => navigate('/new-sale')}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div
          className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 relative
             ${printFormat === 'thermal'
              ? 'w-[320px] rounded-sm min-h-[600px] p-6 text-[10px] border-t-[10px] border-gray-800'
              : 'w-full max-w-4xl rounded-2xl min-h-[600px] p-10 text-[11px] border border-gray-200'
            }`}
        >
          {/* Header */}
          <div className="flex flex-col mb-6 items-center text-center">
            {layout?.showLogo && (
              businessProfile?.profilePicUrl ? (
                <img src={businessProfile.profilePicUrl} alt="Logo" className={`w-12 h-12 object-contain mb-3 ${printFormat === 'standard' ? 'w-16 h-16' : ''}`} />
              ) : (
                <div className={`w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200 font-bold text-gray-300 uppercase mb-3 ${printFormat === 'standard' ? 'w-16 h-16' : ''}`}>
                  Logo
                </div>
              )
            )}
            <h2 className={`${printFormat === 'standard' ? 'text-xl' : 'text-xs'} font-black uppercase text-gray-800`}>
              {businessProfile?.businessName || 'Business Name'}
            </h2>
            <div className="opacity-70 leading-tight text-[10px]">
              {layout?.showHeaderAddress && (businessProfile?.addressStreet || businessProfile?.addressCity) && (
                <p>{[businessProfile?.addressStreet, businessProfile?.addressCity, businessProfile?.addressState, businessProfile?.addressPincode].filter(Boolean).join(', ')}</p>
              )}
              {layout?.showHeaderPhone && businessProfile?.phoneNumber && <p>Mobile: {businessProfile.phoneNumber}</p>}
              {layout?.showHeaderGST && businessProfile?.gstin && <p className="font-bold mt-1 text-gray-800">GSTIN: {businessProfile.gstin}</p>}
            </div>
          </div>

          {/* Title Section */}
          <div className="border-y border-dashed border-gray-300 py-2 mb-4 flex justify-between font-black uppercase text-gray-700 text-[10px]">
            <span>{layout?.invoiceTitle || 'Invoice'}</span>
            <span>#{invoiceNumber}</span>
          </div>

          {/* Date & Customer */}
          <div className="mb-4 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-bold">{new Date(transaction?.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-bold">{transaction?.party || 'Walk-In'}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 border-collapse">
            <thead className="border-b border-gray-200">
              <tr className="text-[9px] text-gray-400 uppercase">
                {layout?.showSerialNo && <th className="text-left py-1">#</th>}
                <th className="text-left py-1">Product</th>
                <th className="text-center py-1">Qty</th>
                {layout?.showUnitPrice && <th className="text-right py-1">Price</th>}
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transaction?.details?.map((item, idx) => (
                <tr key={idx}>
                  {layout?.showSerialNo && <td className="py-3 align-top text-[10px]">{idx + 1}</td>}
                  <td className="py-3">
                    <p className="font-bold text-gray-800 text-[10px]">{item.name}</p>
                  </td>
                  <td className="py-3 text-center align-top text-[10px]">{item.qty}</td>
                  {layout?.showUnitPrice && <td className="py-3 text-right align-top opacity-60 text-[10px]">₹{(item.rate || 0).toFixed(2)}</td>}
                  <td className="py-3 text-right align-top font-bold text-gray-800 text-[10px]">₹{Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="space-y-1.5 border-t border-gray-100 pt-4 mb-8 text-[10px]">
            <div className="flex justify-between">
              <span>Sub-Total:</span>
              <span className="font-bold text-gray-700">₹{totals.subTotal.toFixed(2)}</span>
            </div>

            {layout?.showBillDiscount && totals.billDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Bill Discount:</span>
                <span>-₹{totals.billDiscount.toFixed(2)}</span>
              </div>
            )}

            {layout?.detailedGST ? (
              <div className="text-[8px] opacity-60 pl-3 italic space-y-0.5 border-t border-dashed border-gray-100 pt-1 mt-1">
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span>₹{totals.taxableValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span>₹{totals.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span>₹{totals.sgst.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between text-[9px]">
                <span>Tax (Included):</span>
                <span>₹{totals.taxAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black pt-3 border-t border-dashed border-gray-200 text-gray-900">
              <span>GRAND TOTAL:</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-4">
            <p className="text-[8px] italic leading-relaxed text-gray-400">Note: {layout?.terms || 'Goods once sold will not be taken back.'}</p>

            {layout?.showSignature && (
              <div className="mt-12 pt-2 border-t border-gray-200 text-center relative">
                {businessProfile?.stampUrl && (
                  <img src={businessProfile.stampUrl} alt="Stamp" className="absolute -top-10 right-0 w-24 h-24 object-contain opacity-80" />
                )}
                {businessProfile?.signatureUrl && (
                  <img src={businessProfile.signatureUrl} alt="Signature" className="h-12 mx-auto object-contain mb-2" />
                )}
                <p className="font-bold uppercase text-[9px] text-gray-800">Authorized Signatory</p>
              </div>
            )}

            {/* Social / Website Links */}
            {(layout?.showWebsite || layout?.showInstagram) && (
              <div className="flex justify-center gap-4 opacity-40 mt-8 pt-4 border-t border-gray-100">
                {layout?.showWebsite && layout?.websiteUrl && (
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-600">
                    <Globe size={10} /> {layout.websiteUrl}
                  </div>
                )}
                {layout?.showInstagram && layout?.instagramHandle && (
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-600">
                    <Instagram size={10} /> {layout.instagramHandle}
                  </div>
                )}
              </div>
            )}

            {/* Payment QR Code */}
            {layout?.showPaymentQr && businessProfile?.upiId && (
              <div className="mt-8 pt-4 border-t border-dashed border-gray-200 flex flex-col items-center">
                <p className="text-[9px] font-bold uppercase text-gray-500 mb-2">Scan to Pay</p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`upi://pay?pa=${businessProfile.upiId}&pn=${businessProfile.businessName}&tn=InvoicePayment&am=${totals.grandTotal}&cu=INR`)}&size=120x120`}
                  alt="Payment QR"
                  className="w-20 h-20 mix-blend-multiply"
                />
                <p className="text-[8px] font-mono mt-1 text-gray-400">{businessProfile.upiId}</p>
              </div>
            )}
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
  );
};

export default BillPreview;
