import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import StatsOverview from '../../components/ui/StatsOverview';

const Parties = () => {
  // 1. Stats Data
  const partiesStats = [
    { label: "Total Receivable", amount: "₹50,200", bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    { label: "Total Payable", amount: "₹14,900", bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    { label: "Net Balance", amount: "₹35,300", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    { label: "Total Parties", amount: "10", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  ];

  // 2. Parties List Data (Using Numbers for Credit/Debit)
  const partiesList = [
    { id: 1, name: "Ramesh Kumar", type: "Customer", phone: "+91 98765 43210", credit: 2000, debit: 14500 }, // Debit > Credit -> Green (Take 12500)
    { id: 2, name: "Suresh Distributors", type: "Supplier", phone: "+91 98765 43211", credit: 10000, debit: 1600 }, // Credit > Debit -> Red (Give 8400)
    { id: 3, name: "Anita Sharma", type: "Customer", phone: "+91 98765 43212", credit: 0, debit: 3200 }, // Green
    { id: 4, name: "Wholesale Mart", type: "Supplier", phone: "+91 98765 43213", credit: 5000, debit: 600 }, // Red
    { id: 5, name: "Vijay Patel", type: "Customer", phone: "+91 98765 43214", credit: 1000, debit: 16600 }, // Green
    { id: 6, name: "City Supplies Co.", type: "Supplier", phone: "+91 98765 43215", credit: 0, debit: 0 }, // Zero
    { id: 7, name: "Priya Enterprises", type: "Customer", phone: "+91 98765 43216", credit: 100, debit: 9000 }, // Green
    { id: 8, name: "Manoj Textiles", type: "Customer", phone: "+91 98765 43217", credit: 2000, debit: 7300 }, // Green
    { id: 9, name: "Global Trading", type: "Supplier", phone: "+91 98765 43218", credit: 4500, debit: 2400 }, // Credit > Debit -> Red
    { id: 10, name: "Deepak Singh", type: "Customer", phone: "+91 98765 43219", credit: 300, debit: 5000 }, // Green
  ];

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- HELPER FUNCTION TO CALCULATE BALANCE ---
  const getBalanceDetails = (credit, debit) => {
    const balance = Math.abs(debit - credit);
    // Format to currency string
    const formattedBalance = `₹${balance.toLocaleString('en-IN')}`;

    if (debit > credit) {
      // We have to TAKE -> Green
      return { 
        amount: formattedBalance, 
        color: 'text-green-600', 
        sign: '+' 
      };
    } else if (credit > debit) {
      // We have to GIVE -> Red
      return { 
        amount: formattedBalance, 
        color: 'text-red-500', 
        sign: '' // Usually we don't show minus for payable, just red color, but you can add '-' if you want
      };
    } else {
      // Zero Balance
      return { 
        amount: '₹0', 
        color: 'text-gray-800', 
        sign: '' 
      };
    }
  };

  // --- FILTER LOGIC ---
  const filteredParties = partiesList.filter((party) => {
    const matchesTab = activeTab === 'All' || party.type === activeTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      party.name.toLowerCase().includes(query) || 
      party.phone.includes(query);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Parties</h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} />
          Add Party
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search parties..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['All', 'Customer', 'Supplier'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 md:flex-none
                ${activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <StatsOverview data={partiesStats} />

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredParties.length > 0 ? (
          filteredParties.map((party) => {
            // Calculate balance details dynamically for each party
            const { amount, color, sign } = getBalanceDetails(party.credit, party.debit);

            return (
              <div key={party.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-gray-800 font-semibold text-lg">{party.name}</h3>
                    <span className={`inline-block mt-2 px-2.5 py-1 rounded text-xs font-medium 
                      ${party.type === 'Customer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {party.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Balance</p>
                    <p className={`text-lg font-bold ${color}`}>
                      {sign}{amount}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-50">
                   <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                     {party.phone}
                   </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p>No parties found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Parties;