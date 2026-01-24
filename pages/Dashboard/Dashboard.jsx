import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ShoppingBag, AlertCircle, 
  ArrowRight, Package, DollarSign, Zap, ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA: Period-Specific Datasets ---
const CHART_DATA = {
  'today': [
    { name: '9 AM', sales: 1200 },
    { name: '12 PM', sales: 4500 },
    { name: '3 PM', sales: 3200 },
    { name: '6 PM', sales: 8500 },
    { name: '9 PM', sales: 6000 },
  ],
  'yesterday': [
    { name: '9 AM', sales: 900 },
    { name: '12 PM', sales: 3800 },
    { name: '3 PM', sales: 4100 },
    { name: '6 PM', sales: 7200 },
    { name: '9 PM', sales: 5100 },
  ],
  'this_week': [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5500 },
    { name: 'Thu', sales: 4500 },
    { name: 'Fri', sales: 7000 },
    { name: 'Sat', sales: 8500 },
    { name: 'Sun', sales: 6500 },
  ],
  'last_week': [
    { name: 'Mon', sales: 3500 },
    { name: 'Tue', sales: 4200 },
    { name: 'Wed', sales: 3800 },
    { name: 'Thu', sales: 4100 },
    { name: 'Fri', sales: 6000 },
    { name: 'Sat', sales: 7500 },
    { name: 'Sun', sales: 5800 },
  ],
  'this_month': [
    { name: 'Week 1', sales: 25000 },
    { name: 'Week 2', sales: 28500 },
    { name: 'Week 3', sales: 32000 },
    { name: 'Week 4', sales: 39000 }, 
  ]
};

const RECENT_TRANSACTIONS = [
  { id: 'TRX-1092', customer: 'Ramesh Gupta', type: 'Sale', amount: 1250, time: '10 mins ago', status: 'Paid' },
  { id: 'TRX-1091', customer: 'Walk-in', type: 'Sale', amount: 450, time: '45 mins ago', status: 'Paid' },
  { id: 'TRX-1090', customer: 'Anita Desai', type: 'Sale', amount: 3200, time: '2 hours ago', status: 'Credit' },
  { id: 'PUR-0042', customer: 'Metro Wholesalers', type: 'Purchase', amount: 15000, time: '5 hours ago', status: 'Paid' },
];

const LOW_STOCK_ITEMS = [
  { id: 1, name: 'Maggi Noodles', current: 12, min: 20, unit: 'pkt' },
  { id: 2, name: 'Tata Salt', current: 5, min: 15, unit: 'kg' },
  { id: 3, name: 'Coca Cola', current: 8, min: 24, unit: 'ltr' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE FOR CHART FILTER ---
  const [chartPeriod, setChartPeriod] = useState('today');

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
          <p className="text-sm text-gray-500 font-medium">Here's what's happening in your store today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/new-purchase')} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm">
            Add Purchase
          </button>
          <button onClick={() => navigate('/new-sale')} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]">
            <Plus size={18} /> New Sale
          </button>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Stat 1: Total Sales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp size={12} className="mr-1"/> +12.5%
            </span>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Today's Sales</p>
          <h3 className="text-3xl font-extrabold text-gray-800">₹23,400</h3>
        </div>

        {/* Stat 2: Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={24} /></div>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Daily Avg: 35</span>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Bills</p>
          <h3 className="text-3xl font-extrabold text-gray-800">42</h3>
        </div>

        {/* Stat 3: Low Stock */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle size={24} /></div>
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Action Required</span>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Low Stock Items</p>
          <h3 className="text-3xl font-extrabold text-gray-800">{LOW_STOCK_ITEMS.length}</h3>
        </div>

        {/* Stat 4: Active Offers */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Zap size={24} /></div>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Active Offers</p>
          <h3 className="text-3xl font-extrabold text-gray-800">4</h3>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/MIDDLE: Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Sales Trend</h3>
              <p className="text-xs font-medium text-gray-400">Track your store's sales performance</p>
            </div>
            {/* DYNAMIC FILTER */}
            <select 
              value={chartPeriod} 
              onChange={(e) => setChartPeriod(e.target.value)} 
              className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg px-3 py-1.5 outline-none focus:border-green-500 cursor-pointer"
            >
              <option value="today">Today (Hourly)</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="last_week">Last Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA[chartPeriod]}>
                <defs>
                  {/* Single Clean Gradient for Sales */}
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `₹${value/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: 14, color: '#4ade80' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Low Stock Alert</h3>
            <button onClick={() => navigate('/inventory')} className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex-1 space-y-4">
            {LOW_STOCK_ITEMS.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    <Package size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                    <p className="text-xs text-red-500 font-medium">Only {item.current} {item.unit} left</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium mb-1">Min: {item.min}</p>
                  <button className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg transition-all shadow-sm">
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM: Recent Transactions Table */}
      <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
            See all history
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-4">Transaction ID</th>
                <th className="pb-4">Party</th>
                <th className="pb-4">Type</th>
                <th className="pb-4">Time</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {RECENT_TRANSACTIONS.map((trx, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{trx.id}</td>
                  <td className="py-4 font-medium text-gray-600">{trx.customer}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trx.type === 'Sale' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {trx.type === 'Sale' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                      {trx.type}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400 font-medium">{trx.time}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${trx.status === 'Paid' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className={`py-4 text-right font-extrabold ${trx.type === 'Sale' ? 'text-green-600' : 'text-gray-800'}`}>
                    {trx.type === 'Sale' ? '+' : '-'} ₹{trx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;