import React from 'react';
import { 
  Users, ShoppingCart, Package, BarChart3, 
  ChevronRight 
} from 'lucide-react';

const Dashboard = () => {
  // 1. Top Stats Data
  const statsData = [
    { label: "To Receive", amount: "₹45,240", bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    { label: "To Pay", amount: "₹12,800", bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    { label: "Net Balance", amount: "₹32,440", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    { label: "Today's Sales", amount: "₹8,450", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  ];

  // 2. Action Cards Data
  const actionCards = [
    { title: "Manage Parties", desc: "Customers & Suppliers", icon: Users, color: "bg-blue-500" },
    { title: "New Activity", desc: "Sale or Purchase", icon: ShoppingCart, color: "bg-green-500" },
    { title: "Inventory", desc: "Stock Management", icon: Package, color: "bg-purple-500" },
    { title: "Reports", desc: "View Analytics", icon: BarChart3, color: "bg-orange-500" },
  ];

  // 3. Recent Activity Data
  const recentActivity = [
    { id: 1, name: "Sale to Amit Traders", time: "10 mins ago", amount: "+₹2,450", type: "credit" },
    { id: 2, name: "Purchase from Supplier Co.", time: "2 hours ago", amount: "-₹5,200", type: "debit" },
    { id: 3, name: "Sale to Rajesh Enterprises", time: "Yesterday", amount: "+₹1,800", type: "credit" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 font-medium text-sm mb-1">Welcome,</p>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      {/* 1. Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
        {statsData.map((stat, index) => (
          <div key={index} className={`${stat.bg} ${stat.border} border p-5 rounded-xl`}>
            <p className={`text-sm font-medium ${stat.text} mb-2`}>{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.amount}</p>
          </div>
        ))}
      </div>

      
      {/* 2. Main Actions Grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {actionCards.map((card, index) => (
          <button 
            key={index} 
            className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group text-left"
          >
            <div className="flex items-center gap-5">
              <div className={`${card.color} text-white p-4 rounded-xl`}>
                <card.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>

      {/* 3. Bottom Section: Sales & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Card (Blue) */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 flex flex-col">
          
          {/* Top: Title & Main Amount */}
          <div className="mb-6">
            <h3 className="text-blue-100 text-sm font-medium mb-2">Total Sales Today</h3>
            <span className="text-4xl font-bold">₹8,450</span>
          </div>

          {/* Middle: Comparison Strips (Fill the empty space) */}
          <div className="flex-1 flex flex-col justify-center gap-5 mb-6">
             
             {/* Yesterday Strip */}
             <div className="group cursor-pointer">
                <div className="flex justify-between text-xs text-blue-200 mb-1.5">
                    <span>Yesterday</span>
                    {/* Shows on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-medium">₹7,200</span>
                </div>
                {/* Strip Line */}
                <div className="h-2 bg-blue-800/40 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-300/60 w-[65%] rounded-full"></div>
                </div>
             </div>

             {/* Today Strip */}
             <div className="group cursor-pointer">
                <div className="flex justify-between text-xs text-white mb-1.5">
                    <span className="font-medium">Today</span>
                    {/* Shows on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold">₹8,450</span>
                </div>
                {/* Strip Line */}
                <div className="h-2 bg-blue-800/40 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[78%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                </div>
             </div>

          </div>

          {/* Bottom: Breakdown Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-blue-500/30 p-4 rounded-xl backdrop-blur-sm border border-blue-500/30">
                <p className="text-xs text-blue-100 mb-1">Bills Created</p>
                <p className="text-xl font-bold">14</p>
             </div>
             <div className="bg-blue-500/30 p-4 rounded-xl backdrop-blur-sm border border-blue-500/30">
                <p className="text-xs text-blue-100 mb-1">Cash Received</p>
                <p className="text-xl font-bold">₹3,200</p>
             </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                </div>
                <div className={`font-semibold ${item.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {item.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;