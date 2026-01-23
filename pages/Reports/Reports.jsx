import React, { useState, useMemo } from 'react';
import { 
  Download, Calendar, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Users, ShoppingBag, 
  CreditCard, DollarSign, ChevronDown 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const Reports = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- 1. DYNAMIC MOCK DATA ---
  
  // Data for the Area Chart based on selection
  const chartDataSets = {
    'Today': [
      { name: '9 AM', sales: 1200, profit: 400, purchase: 800 },
      { name: '11 AM', sales: 3500, profit: 1200, purchase: 600 },
      { name: '1 PM', sales: 4200, profit: 1800, purchase: 200 },
      { name: '3 PM', sales: 2800, profit: 900, purchase: 1500 },
      { name: '5 PM', sales: 5100, profit: 2200, purchase: 1000 },
      { name: '7 PM', sales: 3800, profit: 1400, purchase: 1200 },
    ],
    'This Month': [
      { name: 'Jan 1', sales: 4000, profit: 2400, purchase: 1600 },
      { name: 'Jan 5', sales: 3000, profit: 1398, purchase: 1602 },
      { name: 'Jan 10', sales: 2000, profit: 9800, purchase: 1200 },
      { name: 'Jan 15', sales: 2780, profit: 3908, purchase: 1872 },
      { name: 'Jan 20', sales: 1890, profit: 4800, purchase: 900 },
      { name: 'Jan 25', sales: 2390, profit: 3800, purchase: 1590 },
      { name: 'Jan 30', sales: 3490, profit: 4300, purchase: 1190 },
    ],
    'This Year': [
      { name: 'Jan', sales: 45000, profit: 12000, purchase: 30000 },
      { name: 'Feb', sales: 52000, profit: 15000, purchase: 35000 },
      { name: 'Mar', sales: 48000, profit: 11000, purchase: 32000 },
      { name: 'Apr', sales: 61000, profit: 22000, purchase: 38000 },
      { name: 'May', sales: 55000, profit: 18000, purchase: 36000 },
      { name: 'Jun', sales: 67000, profit: 25000, purchase: 41000 },
    ]
  };

  // Data for the Summary Cards based on selection
  const summaryDataSets = {
    'Today': { sales: '₹24,500', purchase: '₹12,200', profit: '₹6,800', parties: '12' },
    'This Month': { sales: '₹2,04,200', purchase: '₹1,28,400', profit: '₹75,800', parties: '142' },
    'This Year': { sales: '₹24.5 L', purchase: '₹15.2 L', profit: '₹8.4 L', parties: '540' },
  };

  // Get current data based on state
  const currentChartData = chartDataSets[dateRange] || chartDataSets['This Month'];
  const currentSummary = summaryDataSets[dateRange] || summaryDataSets['This Month'];

  // Static Data for Categories (Pie Chart)
  const categoryData = [
    { name: 'Groceries', value: 85400, percentage: 42, color: '#3B82F6' },
    { name: 'Dairy', value: 45200, percentage: 22, color: '#10B981' },
    { name: 'Beverages', value: 32800, percentage: 16, color: '#F59E0B' },
    { name: 'Snacks', value: 24600, percentage: 12, color: '#8B5CF6' },
    { name: 'Household', value: 16200, percentage: 8, color: '#EF4444' },
  ];

  const topCustomers = [
    { id: 1, name: 'Amit Traders', txns: 28, amount: '₹45,600', trend: 'up' },
    { id: 2, name: 'Rajesh Enterprises', txns: 22, amount: '₹38,200', trend: 'up' },
    { id: 3, name: 'Sharma & Sons', txns: 19, amount: '₹34,800', trend: 'down' },
    { id: 4, name: 'Kumar Store', txns: 16, amount: '₹29,400', trend: 'up' },
  ];

  const topProducts = [
    { id: 1, name: 'Premium Basmati Rice', sold: '245 units', amount: '₹36,750' },
    { id: 2, name: 'Fortune Sunflower Oil', sold: '186 units', amount: '₹33,480' },
    { id: 3, name: 'Tata Salt', sold: '520 units', amount: '₹13,000' },
    { id: 4, name: 'Red Label Tea', sold: '98 units', amount: '₹27,440' },
  ];

  const handleDateChange = (range) => {
    setDateRange(range);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8" onClick={() => setIsDropdownOpen(false)}>
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business performance insights</p>
        </div>
        
        <div className="flex gap-3">
          {/* Custom Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Calendar size={18} className="text-gray-400" />
              {dateRange}
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {['Today', 'This Month', 'This Year'].map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => handleDateChange(opt)} 
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${dateRange === opt ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-600'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-gray-200">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* --- SUMMARY CARDS (DYNAMIC) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingBag size={80} className="text-green-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><ShoppingBag size={20} /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} /> +12.5%
            </span>
          </div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Sales</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{currentSummary.sales}</h3>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard size={80} className="text-blue-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CreditCard size={20} /></div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} /> +8.3%
            </span>
          </div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Purchases</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{currentSummary.purchase}</h3>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} className="text-purple-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><DollarSign size={20} /></div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} /> +18.2%
            </span>
          </div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Net Profit</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{currentSummary.profit}</h3>
        </div>

        {/* Active Parties */}
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} className="text-orange-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Users size={20} /></div>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowDownRight size={12} /> -2.1%
            </span>
          </div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Active Parties</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{currentSummary.parties}</h3>
        </div>
      </div>

      {/* --- CHARTS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Area Chart (Sales & Profit) - DYNAMIC DATA */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">Sales & Profit Trend ({dateRange})</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-green-500"></div>Sales</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Profit</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '500' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-6">Category Distribution</h3>
          
          <div className="h-48 w-full relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-xs uppercase">Total</span>
              <span className="text-xl font-bold text-gray-800">{dateRange === 'Today' ? '₹24k' : dateRange === 'This Year' ? '₹24L' : '₹2L'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {categoryData.map((cat) => (
               <div key={cat.name} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                   <span className="text-gray-600">{cat.name}</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}></div>
                   </div>
                   <span className="font-medium text-gray-800 w-8 text-right">{cat.percentage}%</span>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- LEADERBOARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Top Customers */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Top Customers</h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
                    <p className="text-xs text-gray-400">{customer.txns} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{customer.amount}</p>
                  <p className={`text-xs flex items-center justify-end gap-0.5 ${customer.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {customer.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} 
                    {customer.trend === 'up' ? 'High' : 'Low'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.sold} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{product.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- QUICK INSIGHTS BANNER --- */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-200">
        <div className="flex items-center gap-2 mb-4 opacity-90">
           <TrendingUp size={20} />
           <span className="text-sm font-semibold uppercase tracking-wider">Quick Insights</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <p className="text-xs text-orange-100 mb-1">Best Selling Day</p>
            <p className="text-lg font-bold">Jan 21, 2026</p>
            <p className="text-xs text-orange-100 mt-1">₹28,000 in sales</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <p className="text-xs text-orange-100 mb-1">Avg. Transaction</p>
            <p className="text-lg font-bold">₹1,245</p>
            <p className="text-xs text-orange-100 mt-1">+15% from last month</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <p className="text-xs text-orange-100 mb-1">Profit Margin</p>
            <p className="text-lg font-bold">37.2%</p>
            <p className="text-xs text-orange-100 mt-1">Above target (35%)</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reports;