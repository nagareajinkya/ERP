import React, { useState, useMemo } from 'react';
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

const Reports = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- 1. DYNAMIC DATA SETS ---
  const dataSets = useMemo(() => ({
    'Today': {
      chart: [
        { name: '9 AM', sales: 1200, profit: 400 },
        { name: '12 PM', sales: 4500, profit: 1500 },
        { name: '3 PM', sales: 3200, profit: 1100 },
        { name: '6 PM', sales: 6100, profit: 2200 },
        { name: '9 PM', sales: 2800, profit: 900 },
      ],
      summary: { sales: '₹17,800', profit: '₹6,100', gst: '₹1,540', deadStock: '12' }
    },
    'Last 7 Days': {
      chart: [
        { name: 'Mon', sales: 12000, profit: 4000 },
        { name: 'Tue', sales: 15000, profit: 5500 },
        { name: 'Wed', sales: 11000, profit: 3200 },
        { name: 'Thu', sales: 18000, profit: 7000 },
        { name: 'Fri', sales: 14000, profit: 4800 },
        { name: 'Sat', sales: 22000, profit: 9000 },
        { name: 'Sun', sales: 19000, profit: 7500 },
      ],
      summary: { sales: '₹1,11,000', profit: '₹41,000', gst: '₹9,800', deadStock: '10' }
    },
    'This Month': {
      chart: [
        { name: 'Week 1', sales: 45000, profit: 12000 },
        { name: 'Week 2', sales: 52000, profit: 18000 },
        { name: 'Week 3', sales: 48000, profit: 15000 },
        { name: 'Week 4', sales: 61000, profit: 21000 },
      ],
      summary: { sales: '₹2,04,200', profit: '₹75,800', gst: '₹18,450', deadStock: '12' }
    },
    'This Year': {
      chart: [
        { name: 'Jan', sales: 204000, profit: 75000 },
        { name: 'Feb', sales: 180000, profit: 62000 },
        { name: 'Mar', sales: 240000, profit: 95000 },
        { name: 'Apr', sales: 215000, profit: 82000 },
      ],
      summary: { sales: '₹8,39,000', profit: '₹3,14,000', gst: '₹72,000', deadStock: '15' }
    }
  }), []);

  const categoryData = [
    { name: 'Grains', value: 45, color: '#3B82F6' },
    { name: 'Dairy', value: 25, color: '#10B981' },
    { name: 'Snacks', value: 20, color: '#F59E0B' },
    { name: 'Others', value: 10, color: '#8B5CF6' },
  ];

  const topProducts = [
    { id: 1, name: 'Basmati Rice (Premium)', qty: '450 kg', revenue: '₹40,500', profit: '₹4,500' },
    { id: 2, name: 'Fortune Oil 1L', qty: '210 pcs', revenue: '₹31,500', profit: '₹2,100' },
    { id: 3, name: 'Amul Butter 500g', qty: '125 pcs', revenue: '₹12,500', profit: '₹1,500' },
    { id: 4, name: 'Maggi Family Pack', qty: '320 pkts', revenue: '₹28,800', profit: '₹3,200' },
  ];

  const currentData = dataSets[dateRange];

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
                {Object.keys(dataSets).map(opt => (
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
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm group hover:border-blue-300 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={20}/></div>
            <span className="flex items-center text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full"><ArrowUpRight size={12}/> 12%</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{currentData.summary.sales}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm group hover:border-green-300 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><DollarSign size={20}/></div>
            <span className="flex items-center text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full"><ArrowUpRight size={12}/> 18%</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Profit</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{currentData.summary.profit}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm group hover:border-purple-300 transition-colors">
          <div className="flex justify-between items-start mb-4"><div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Receipt size={20}/></div></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">GST Collected</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{currentData.summary.gst}</h3>
          <p className="text-[10px] font-bold text-purple-500 mt-1">Ready for filing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm group hover:border-orange-300 transition-colors">
          <div className="flex justify-between items-start mb-4"><div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><Box size={20}/></div></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dead Stock</p>
          <h3 className="text-2xl font-black text-orange-600 mt-1">{currentData.summary.deadStock} Items</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1">Low movement</p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={18} className="text-green-500"/> Performance Trend</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Sales</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase"><div className="w-2 h-2 rounded-full bg-green-500"></div> Profit</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.chart}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 mb-8">Sales by Category</h3>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />)}
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
      </div>

      {/* TOP PRODUCTS TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><TableIcon size={18} className="text-blue-500"/> Top Performing Products</h3>
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
        <div className="absolute top-0 right-0 p-8 opacity-10"><Receipt size={120}/></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-md">
                <div className="flex items-center gap-2 text-blue-400 mb-2"><AlertCircle size={18}/><span className="text-[10px] font-black uppercase tracking-widest">GSTR Report Ready</span></div>
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