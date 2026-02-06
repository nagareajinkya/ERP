import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Calendar, ArrowUpRight, ArrowDownRight,
  RefreshCw, Eye, Download, CheckCircle2, Clock, X, Printer
} from 'lucide-react';
import api from '../../src/api';
import SearchBar from '../../components/common/SearchBar';
import TabsBar from '../../components/common/TabsBar';

const Transactions = () => {
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [dateFilter, setDateFilter] = useState('Today');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);

  // Modal State
  const [selectedBill, setSelectedBill] = useState(null);

  // --- FETCH TRANSACTIONS FROM API ---
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/trading/transactions/search', {
          params: {
            query: searchQuery,
            type: filterType === 'All' ? 'All' : filterType.toUpperCase(),
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
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filterType, dateFilter, customDateRange]);

  const filteredData = transactions;

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
    if (type === 'Sale') return <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ArrowUpRight size={18} /></div>;
    if (type === 'Purchase') return <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ArrowDownRight size={18} /></div>;
    return <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><RefreshCw size={18} /></div>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500 font-medium">History of all sales, purchases, and adjustments.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* FILTERS & TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">

        {/* TABS */}
        <TabsBar tabs={['All', 'Sale', 'Purchase', 'Adjustment']} activeTab={filterType} onTabChange={setFilterType} variant="default" className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto" />

        {/* SEARCH & DATE */}
        <div className="flex gap-3 w-full md:w-auto">
          <SearchBar placeholder="Search Invoice or Party..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 md:w-64" />
          <div className="flex gap-2 items-center">
            {/* Custom Date Inputs */}
            {dateFilter === 'Custom Range' && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-green-500 transition-all shadow-sm"
                />
                <span className="text-gray-400 font-bold self-center">-</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-green-500 transition-all shadow-sm"
                />
              </div>
            )}

            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none cursor-pointer appearance-none"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>All Time</option>
                <option>Custom Range</option>
              </select>
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
                        <p className={`text-xs font-bold ${trx.type === 'Sale' ? 'text-green-600' : trx.type === 'Purchase' ? 'text-red-500' : 'text-orange-500'}`}>
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

    </div>
  );
};

export default Transactions;
