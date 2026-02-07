import React, { useState } from 'react';
import {
  Download, Calendar, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Users, ShoppingBag,
  CreditCard, DollarSign, ChevronDown, FileText,
  AlertCircle, Box, Table as TableIcon, Receipt
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import { useReports } from '../../hooks/useReports';

const Reports = () => {
  /* import { useReports } from '../../hooks/useReports'; */ // Added below

  const {
    dateRange,
    setDateRange,
    currentData,
    categoryData,
    topProducts,
    availableRanges
  } = useReports();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">

      {/* HEADER & EXPORTS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
          <p className="text-sm text-gray-500 font-medium">Insights based on your store's recent activity.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:shadow-md transition-all min-w-[160px] justify-between"
            >
              <span className="flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> {dateRange}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {availableRanges.map(opt => (
                  <button key={opt} onClick={() => { setDateRange(opt); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${dateRange === opt ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>{opt}</button>
                ))}
              </div>
            )}
          </div>

          <div className="h-10 w-[1px] bg-gray-200 mx-1" />

          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"><FileText size={18} className="text-red-500" /> PDF</button>
          <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"><Download size={18} /> Excel</button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Sales" value={currentData.summary.sales} icon={ShoppingBag} iconColor="bg-blue-50 text-blue-600" borderColor="border-blue-100" />
        <StatCard label="Net Profit" value={currentData.summary.profit} icon={DollarSign} iconColor="bg-green-50 text-green-600" borderColor="border-green-100" />
        <StatCard label="GST Collected" value={currentData.summary.gst} icon={Receipt} iconColor="bg-purple-50 text-purple-600" borderColor="border-purple-100" />
        <StatCard label="Dead Stock" value={`${currentData.summary.deadStock} Products`} icon={Box} iconColor="bg-orange-50 text-orange-600" borderColor="border-orange-100" valueColor="text-orange-600" />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <h3 className="font-bold text-gray-800 mb-8">Sales by Category</h3>
        <div className="h-56 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Market Share</span>
            <span className="text-2xl font-black text-gray-800">100%</span>
          </div>
        </div>
        <div className="mt-8 space-y-3 flex-1 overflow-y-auto">
          {categoryData.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div><span className="text-sm font-bold text-gray-600">{cat.name}</span></div><span className="text-sm font-black text-gray-800">{cat.value}%</span></div>
          ))}
        </div>
      </div>

      {/* TOP PRODUCTS TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><TableIcon size={18} className="text-blue-500" /> Top Performing Products</h3>
          <button className="text-xs font-bold text-blue-600 hover:underline">View Full Inventory</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr><th className="px-6 py-4">Product Name</th><th className="px-6 py-4 text-center">Quantity Sold</th><th className="px-6 py-4 text-right">Revenue</th><th className="px-6 py-4 text-right text-green-600">Profit</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold text-sm">
              {topProducts.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors"><td className="px-6 py-4 text-gray-800">{p.name}</td><td className="px-6 py-4 text-center text-gray-500">{p.qty}</td><td className="px-6 py-4 text-right text-gray-800">{p.revenue}</td><td className="px-6 py-4 text-right text-green-600">{p.profit}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TAX BANNER */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Receipt size={120} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-blue-400 mb-2"><AlertCircle size={18} /><span className="text-[10px] font-black uppercase tracking-widest">GSTR Report Ready</span></div>
            <h2 className="text-2xl font-black mb-2">GST Compliance Hub</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Your net tax liability for {dateRange} is calculated based on sales and purchase history. Download the zip for easy filing.</p>
          </div>
          <div className="flex gap-4"><button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold transition-all backdrop-blur-md">View Details</button><button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/50">Download Tax Docs</button></div>
        </div>
      </div>

    </div>
  );
};

export default Reports;