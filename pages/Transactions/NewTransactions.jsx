import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Share2, Plus, Trash2, ChevronDown, Calendar 
} from 'lucide-react';

const NewTransaction = ({ type = 'sale' }) => {
  const navigate = useNavigate();
  
  // 1. Theme Configuration
  const isSale = type === 'sale';
  const theme = {
    primary: isSale ? 'bg-green-600' : 'bg-red-600',
    primaryHover: isSale ? 'hover:bg-green-700' : 'hover:bg-red-700',
    secondary: isSale ? 'bg-green-50' : 'bg-red-50',
    text: isSale ? 'text-green-600' : 'text-red-600',
    border: isSale ? 'focus:ring-green-200' : 'focus:ring-red-200',
    label: isSale ? 'Sale' : 'Purchase'
  };

  // 2. Form State
  const [party, setParty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { id: 1, name: '', qty: 1, price: '', amount: 0 }
  ]);
  const [paidAmount, setPaidAmount] = useState('');

  // 3. Focus Management (For Keyboard UX)
  const nameInputRefs = useRef([]); // To store references to item name inputs
  const [shouldFocusNew, setShouldFocusNew] = useState(false); // Trigger to focus new row

  // 4. Effect: Auto-focus the new row's Name input when an item is added
  useEffect(() => {
    if (shouldFocusNew && items.length > 0) {
      const lastIndex = items.length - 1;
      // Focus the input of the last item
      if (nameInputRefs.current[lastIndex]) {
        nameInputRefs.current[lastIndex].focus();
      }
      setShouldFocusNew(false); // Reset trigger
    }
  }, [items, shouldFocusNew]);

  // 5. Helper Functions
  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: 1, price: '', amount: 0 }]);
    setShouldFocusNew(true); // Tell useEffect to focus this new row
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Auto-calculate amount
        if (field === 'qty' || field === 'price') {
          updatedItem.amount = (updatedItem.qty || 0) * (updatedItem.price || 0);
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  // 6. Handle "Enter" Key in Price Field
  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent any default form submission
      addItem(); // Trigger add item
    }
  };

  // Derived Totals
  const totalBill = items.reduce((sum, item) => sum + item.amount, 0);
  const balanceDue = totalBill - (Number(paidAmount) || 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">New Activity</h1>
        <div className="bg-white p-1.5 rounded-xl inline-flex border border-gray-200 shadow-sm">
          <button 
            onClick={() => navigate('/new-sale')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isSale ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Sale
          </button>
          <button 
            onClick={() => navigate('/new-purchase')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              !isSale ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Purchase
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Party & Date */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Select Party</label>
                <div className="relative">
                  <select 
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    className={`w-full p-3 bg-gray-50 border-none rounded-xl text-gray-800 font-medium focus:ring-2 ${theme.border} outline-none appearance-none`}
                  >
                    <option value="" disabled>Choose Customer / Supplier</option>
                    <option value="Ramesh Kumar">Ramesh Kumar</option>
                    <option value="Suresh Distributors">Suresh Distributors</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full p-3 bg-gray-50 border-none rounded-xl text-gray-800 font-medium focus:ring-2 ${theme.border} outline-none`}
                  />
                  <Calendar className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Items</h3>
              <button 
                onClick={addItem}
                className={`text-sm font-medium ${theme.text} hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1`}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 mb-3 px-2">
              <div className="col-span-5 text-xs font-medium text-gray-400 uppercase">Item Name</div>
              <div className="col-span-2 text-xs font-medium text-gray-400 uppercase text-center">Qty</div>
              <div className="col-span-2 text-xs font-medium text-gray-400 uppercase text-right">Price</div>
              <div className="col-span-2 text-xs font-medium text-gray-400 uppercase text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items List */}
            <div className="space-y-3 flex-1">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center group">
                  
                  {/* Item Name Input (with Ref) */}
                  <div className="col-span-5">
                    <input 
                      ref={(el) => (nameInputRefs.current[index] = el)} // Assign ref
                      type="text" 
                      placeholder="Enter item name"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className={`w-full p-2.5 bg-gray-50 rounded-lg text-sm border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none transition-all`}
                    />
                  </div>

                  {/* Qty Input */}
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value))}
                      className={`w-full p-2.5 bg-gray-50 rounded-lg text-sm text-center border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none transition-all`}
                    />
                  </div>

                  {/* Price Input (With onKeyDown) */}
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      placeholder="0"
                      value={item.price}
                      onKeyDown={handlePriceKeyDown} // Detect Enter key
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                      className={`w-full p-2.5 bg-gray-50 rounded-lg text-sm text-right border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none transition-all`}
                    />
                  </div>

                  {/* Calculated Amount */}
                  <div className="col-span-2 text-right font-medium text-gray-700">
                    ₹{item.amount.toLocaleString()}
                  </div>

                  {/* Delete Action */}
                  <div className="col-span-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => removeItem(item.id)}
                      tabIndex={-1} // Prevent tabbing to delete button to keep flow smooth
                      className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end items-center gap-12">
               <span className="text-gray-400 text-sm">Total Items: {items.length}</span>
               <div className="text-right">
                  <span className="block text-xs text-gray-400 uppercase mb-1">Total Bill</span>
                  <span className="text-2xl font-bold text-gray-800">₹{totalBill.toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Same as before) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-6">Payment Details</h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${theme.secondary} border border-transparent`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${theme.text}`}>Grand Total</span>
                  <span className={`text-xl font-bold ${theme.text}`}>₹{totalBill.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  {isSale ? 'Amount Received' : 'Amount Paid'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-medium">₹</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 font-bold focus:ring-2 ${theme.border} outline-none transition-all`}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center py-2 px-1">
                <span className="text-sm text-gray-500">Balance Due</span>
                <span className={`font-bold ${balanceDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₹{balanceDue.toLocaleString()}
                </span>
              </div>
              <hr className="border-gray-100 my-4" />
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  <Share2 size={18} /> Share
                </button>
                <button className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-medium shadow-lg shadow-gray-200 transition-all ${theme.primary} ${theme.primaryHover}`}>
                  <Save size={18} /> Save Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;