import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, Calendar, ArrowUpRight, ArrowDownRight,
  Sliders, Eye, Download, CheckCircle2, Clock, X, Printer, Edit, Trash2, ChevronDown
} from 'lucide-react';
import api from '../../src/api';
import SearchBar from '../../components/common/SearchBar';
import TabsBar from '../../components/common/TabsBar';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Transactions = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [dateFilter, setDateFilter] = useState('Today');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Modal State
  const [selectedBill, setSelectedBill] = useState(null);

  // Refs
  const dropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- FETCH TRANSACTIONS FROM API ---
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/trading/transactions/search', {
          params: {
            query: searchQuery,
            type: filterType === 'All' ? 'All' : filterType.toUpperCase(),
            dateRange: dateFilter,
            startDate: dateFilter === 'Custom Range' ? customDateRange.start : null,
            endDate: dateFilter === 'Custom Range' ? customDateRange.end : null
          }
        });
        setTransactions(data.data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filterType, dateFilter, customDateRange]);

  const filteredData = transactions;

  // --- CALCULATE TOTALS FOR FOOTER ---
  const totalCredit = filteredData
    .filter(trx => trx.type?.toUpperCase() === 'SALE')
    .reduce((sum, trx) => sum + (trx.amount || 0), 0);

  const totalDebit = filteredData
    .filter(trx => trx.type?.toUpperCase() === 'PURCHASE' || trx.type?.toUpperCase() === 'ADJUSTMENT')
    .reduce((sum, trx) => sum + (trx.amount || 0), 0);

  // --- HELPER: Status Badge ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700"><CheckCircle2 size={12} /> Paid</span>;
      case 'Unpaid': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700"><Clock size={12} /> Unpaid</span>;
      case 'Partial': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700"><Clock size={12} /> Partial</span>;
      case 'Loss': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500">Loss</span>;
      default: return null;
    }
  };

  // --- HELPER: Type Icon ---
  const getTypeIcon = (type) => {
    const typeUpper = type?.toUpperCase();
    if (typeUpper === 'SALE') return <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ArrowUpRight size={18} /></div>;
    if (typeUpper === 'PURCHASE') return <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ArrowDownRight size={18} /></div>;
    return <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Sliders size={18} /></div>;
  };

  // --- EXPORT TO CSV ---
  const handleExportReport = () => {
    // Prepare CSV headers
    const headers = ['Transaction ID', 'Type', 'Party', 'Date', 'Time', 'Products', 'Payment Mode', 'Payment Status', 'Amount', 'Paid Amount', 'Due Amount'];

    // Convert filtered data to CSV rows
    const rows = filteredData.map(trx => [
      trx.id,
      trx.type,
      trx.party,
      trx.date,
      trx.time,
      trx.products,
      trx.paymentMode,
      trx.status,
      trx.amount,
      trx.paidAmount || 0,
      // Calculate due amount for both Unpaid and Partial statuses
      (trx.status === 'Partial' || trx.status === 'Unpaid') ? (trx.amount - (trx.paidAmount || 0)) : 0
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with current date and filters
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `transactions_${filterType}_${dateFilter}_${dateStr}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- EXPORT TO PDF ---
  const handleExportPDF = async () => {
    try {
      // Fetch business details fresh from API
      console.log('Fetching business details...');
      const { data: businessData } = await api.get('/auth/me');
      console.log('Business data received:', businessData);

      const business = businessData?.business || businessData || {};
      console.log('Business info:', business);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 15;

      // --- LOGO (if available) ---
      if (business.logo) {
        try {
          // Add logo - centered at top
          doc.addImage(business.logo, 'PNG', pageWidth / 2 - 15, yPos, 30, 30);
          yPos += 35;
        } catch (logoError) {
          console.error('Error adding logo:', logoError);
        }
      }

      // --- HEADER: Business Details ---
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(business.name || business.businessName || 'Business Name', pageWidth / 2, yPos, { align: 'center' });

      yPos += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      if (business.address) {
        doc.text(business.address, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }

      if (business.gstin) {
        doc.text(`GSTIN: ${business.gstin}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }

      if (business.ownerName || business.owner) {
        doc.text(`Owner: ${business.ownerName || business.owner}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }

      // Add line separator
      yPos += 3;
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;

      // --- TITLE ---
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      // --- DATE RANGE (not filter name) ---
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      let dateRangeText = '';
      if (dateFilter === 'All Time') {
        dateRangeText = 'All Time';
      } else if (dateFilter === 'Today') {
        dateRangeText = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } else if (dateFilter === 'Yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        dateRangeText = yesterday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } else if (dateFilter === 'This Week') {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateRangeText = `${weekAgo.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      } else if (dateFilter === 'This Month') {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        dateRangeText = `${monthStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      } else if (dateFilter === 'Custom Range' && customDateRange.start && customDateRange.end) {
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        dateRangeText = `${startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      }

      if (filterType !== 'All') {
        doc.text(`${filterType} Transactions | ${dateRangeText}`, pageWidth / 2, yPos, { align: 'center' });
      } else {
        doc.text(dateRangeText, pageWidth / 2, yPos, { align: 'center' });
      }

      yPos += 4;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // --- TRANSACTION TABLE ---
      const tableData = filteredData.map(trx => [
        trx.id,
        trx.type,
        trx.party,
        trx.date,
        trx.time || '',
        trx.status,
        `Rs. ${trx.amount.toLocaleString()}`,
        `Rs. ${(trx.paidAmount || 0).toLocaleString()}`,
        `Rs. ${((trx.status === 'Partial' || trx.status === 'Unpaid') ? (trx.amount - (trx.paidAmount || 0)) : 0).toLocaleString()}`
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['ID', 'Type', 'Party', 'Date', 'Time', 'Status', 'Amount', 'Paid', 'Due']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 20 },
          2: { cellWidth: 35 },
          3: { cellWidth: 22 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { halign: 'right', cellWidth: 22 },
          7: { halign: 'right', cellWidth: 22 },
          8: { halign: 'right', cellWidth: 22 }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // --- TOTALS FOOTER ---
      yPos = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      doc.setTextColor(34, 197, 94); // Green for credit
      doc.text(`Total Credit: Rs. ${totalCredit.toLocaleString()}`, pageWidth - 14, yPos, { align: 'right' });

      yPos += 6;
      doc.setTextColor(220, 38, 38); // Red for debit
      doc.text(`Total Debit: Rs. ${totalDebit.toLocaleString()}`, pageWidth - 14, yPos, { align: 'right' });

      yPos += 6;
      const netBalance = totalCredit - totalDebit;
      doc.setTextColor(...(netBalance >= 0 ? [34, 197, 94] : [220, 38, 38]));
      doc.text(`Net Balance: ${netBalance >= 0 ? '+' : '-'}Rs. ${Math.abs(netBalance).toLocaleString()}`, pageWidth - 14, yPos, { align: 'right' });

      // Save PDF
      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`transactions_${filterType}_${dateRangeText.replace(/[\/\s]/g, '_')}_${dateStr}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50/50 p-6 pb-16 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500 font-medium">History of all sales, purchases, and adjustments.</p>
        </div>
        <div className="flex gap-3">
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-green-50 hover:border-green-500 hover:text-green-600 hover:shadow-md transition-all shadow-sm"
            >
              <Download size={18} /> Export Report
              <ChevronDown size={16} className={`transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    handleExportReport();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3"
                >
                  <Download size={16} />
                  <div>
                    <div className="font-bold">Export as CSV</div>
                    <div className="text-xs text-gray-400 font-normal">Spreadsheet format</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleExportPDF();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3 border-t border-gray-100"
                >
                  <Printer size={16} />
                  <div>
                    <div className="font-bold">Export as PDF</div>
                    <div className="text-xs text-gray-400 font-normal">Professional report</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTERS & TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">

        {/* TABS */}
        <TabsBar tabs={['All', 'Sale', 'Purchase', 'Adjustment']} activeTab={filterType} onTabChange={setFilterType} variant="default" className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto" />

        {/* SEARCH & DATE */}
        <div className="flex gap-3 w-full md:w-auto flex-wrap items-center">
          <SearchBar placeholder="Search Invoice or Party..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 md:w-64" />

          {/* Date Filter Pills */}
          <div className="flex gap-2 items-center">
            {/* Custom Date Inputs */}
            {dateFilter === 'Custom Range' && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                />
                <span className="text-gray-400 font-bold self-center text-xs">to</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                />
              </div>
            )}

            {/* Modern Pill-Style Date Filter */}
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
              {['Today', 'Yesterday', 'This Week', 'This Month'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${dateFilter === filter
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  {filter}
                </button>
              ))}

              {/* Dropdown for More Options */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 ${dateFilter === 'All Time' || dateFilter === 'Custom Range'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  <Calendar size={14} />
                  {dateFilter === 'All Time' || dateFilter === 'Custom Range' ? dateFilter : 'More'}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setDateFilter('All Time');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                    >
                      <Calendar size={14} />
                      All Time
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('Custom Range');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                    >
                      <Calendar size={14} />
                      Custom Range
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Transaction</th>
                <th className="py-4 px-6">Party / Details</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6 text-center">Payment</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filteredData.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(trx.type)}
                      <div>
                        <p className="font-bold text-gray-800">{trx.id}</p>
                        <p className={`text-xs font-bold ${trx.type?.toUpperCase() === 'SALE' ? 'text-green-600' : trx.type?.toUpperCase() === 'PURCHASE' ? 'text-red-600' : 'text-orange-600'}`}>
                          {trx.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-800">{trx.party}</p>
                    <p className="text-xs text-gray-400 font-medium">{trx.products} Products • {trx.paymentMode}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-700">{trx.date}</p>
                    <p className="text-xs text-gray-400">{trx.time}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(trx.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className={`text-base font-extrabold ${trx.type === 'Sale' ? 'text-green-600' : trx.type === 'Purchase' ? 'text-gray-800' : 'text-gray-400'}`}>
                      {trx.type === 'Sale' ? '+' : trx.type === 'Purchase' ? '-' : ''} ₹{trx.amount.toLocaleString()}
                    </p>
                    {trx.status === 'Partial' && <p className="text-[10px] text-red-500 font-bold">Due: ₹{(trx.amount - trx.paidAmount).toLocaleString()}</p>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => setSelectedBill(trx)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        const path = trx.type.toUpperCase() === 'SALE' ? '/new-sale' : '/new-purchase';
                        navigate(path, { state: { mode: 'edit', transaction: trx } });
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete transaction #${trx.id}? This will revert stock and party balance.`)) {
                          try {
                            await api.delete(`/trading/transactions/${trx.id}`);
                            setTransactions(prev => prev.filter(t => t.id !== trx.id));
                          } catch (err) {
                            console.error("Failed to delete", err);
                            alert("Failed to delete transaction");
                          }
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-medium">No transactions found for this filter.</div>
          )}
        </div>
      </div>

      {/* --- VIEW BILL MODAL --- */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Transaction Details</h3>
                <p className="text-sm text-gray-500">{selectedBill.id} • {selectedBill.date}</p>
              </div>
              <button onClick={() => setSelectedBill(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={20} /></button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Party Info */}
              <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Party / Customer</p>
                  <p className="font-bold text-gray-800">{selectedBill.party}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Total Amount</p>
                  <p className="font-bold text-xl text-green-600">₹{selectedBill.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Items List */}
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Products Purchased</h4>
              <div className="border rounded-xl overflow-hidden border-gray-100 mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedBill.details.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-medium text-gray-700">{item.name} <span className="text-xs text-gray-400 font-normal">(@ ₹{item.rate})</span></td>
                        <td className="px-4 py-2.5 text-center text-gray-600">{item.qty}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-800">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                  <Download size={18} /> PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all">
                  <Printer size={18} /> Print Bill
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- CLEAN SUMMARY FOOTER --- */}
      <div className="fixed bottom-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 rounded-tl-3xl rounded-tr-3xl" style={{ left: '256px' }}>
        <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">

          {/* Credit */}
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <ArrowUpRight size={16} className="text-green-500" />
            <span>Credit</span>
            <span className="text-green-600 font-bold">
              ₹{totalCredit.toLocaleString()}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-gray-200" />

          {/* Debit */}
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <ArrowDownRight size={16} className="text-red-500" />
            <span>Debit</span>
            <span className="text-red-600 font-bold">
              ₹{totalDebit.toLocaleString()}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-gray-200" />

          {/* Net Balance */}
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-gray-500">Net</span>
            <span
              className={`font-extrabold ${totalCredit - totalDebit >= 0
                ? 'text-green-700'
                : 'text-red-700'
                }`}
            >
              {totalCredit - totalDebit >= 0 ? '+' : '-'}₹
              {Math.abs(totalCredit - totalDebit).toLocaleString()}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Transactions;
