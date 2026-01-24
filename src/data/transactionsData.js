export const PRODUCTS = [
  { id: 8, name: 'Aashirvaad Atta', unit: 'kg', price: 55 },
  { id: 3, name: 'Amul Butter', unit: 'pc', price: 56 },
  { id: 1, name: 'Basmati Rice', unit: 'kg', price: 120 },
  { id: 88, name: 'Britannia Cake', unit: 'pc', price: 30 },
  { id: 6, name: 'Coca Cola', unit: 'ltr', price: 65 },
  { id: 7, name: 'Dettol Handwash', unit: 'ml', price: 99 },
  { id: 4, name: 'Maggi Noodles', unit: 'pkt', price: 14 },
  { id: 2, name: 'Sugar', unit: 'kg', price: 45 },
  { id: 5, name: 'Tata Salt', unit: 'kg', price: 28 },
].sort((a, b) => a.name.localeCompare(b.name));

export const CUSTOMERS = [
  { id: 'walk-in', name: 'Walk-in Customer', type: 'Walk-in', phone: '' }, 
  { id: 102, name: 'Anita Desai', type: 'Regular', phone: '9988776655' },
  { id: 101, name: 'Ramesh Gupta', type: 'Top Spender', phone: '9876543210' },
  { id: 103, name: 'Vikram Singh', type: 'Top Spender', phone: '7766554433' },
];

// --- OFFERS CONFIG ---
export const ALL_OFFERS = [
  { id: 'OFF-01', name: 'Summer Sale', triggerType: 'all', action: 'cart_discount', value: 5, desc: '5% Storewide Off' },
  { id: 'OFF-02', name: 'Sugar Rush', triggerType: 'product_buy', triggerProduct: 'Sugar', action: 'item_discount', value: 20, minQty: 5, desc: '₹20 Off per 5kg Sugar' },
  { id: 'OFF-03', name: 'Rice-Maggi Combo', triggerType: 'product_buy', triggerProduct: 'Basmati Rice', action: 'auto_add', rewardProduct: 'Maggi Noodles', rewardQty: 1, price: 0.01, minQty: 1, desc: '1 Free Maggi per kg Rice' },
  { id: 'OFF-04', name: 'Top Spender Feast', triggerType: 'product_buy', triggerProduct: 'Maggi Noodles', requiredCustomer: 'Top Spender', action: 'auto_add', rewardProduct: 'Sugar', rewardQty: 2, price: 0.01, minQty: 10, desc: 'Free 2kg Sugar on 10 Maggi' }
];