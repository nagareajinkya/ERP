export const MOCK_PRODUCTS = [
  { id: 1, name: 'Amul Butter', unit: 'pc' },
  { id: 2, name: 'Basmati Rice', unit: 'kg' },
  { id: 3, name: 'Britannia Biscuits', unit: 'pkt' },
  { id: 4, name: 'Coca Cola', unit: 'ltr' },
  { id: 5, name: 'Dove Soap', unit: 'pc' },
  { id: 6, name: 'Fortune Oil', unit: 'ltr' },
  { id: 7, name: 'Maggi Noodles', unit: 'pkt' },
  { id: 8, name: 'Sugar', unit: 'kg' },
  { id: 9, name: 'Tata Salt', unit: 'kg' },
  { id: 10, name: 'Wheat Flour', unit: 'kg' },
].sort((a, b) => a.name.localeCompare(b.name));

export const MOCK_CUSTOMERS = [
  { id: 101, name: 'Ramesh Gupta', type: 'Frequent', spend: '₹45,000', spendValue: 45000, visits: 12 },
  { id: 102, name: 'Suresh Patil', type: 'Top Spender', spend: '₹82,000', spendValue: 82000, visits: 4 },
  { id: 103, name: 'Anita Desai', type: 'Regular', spend: '₹12,000', spendValue: 12000, visits: 8 },
  { id: 104, name: 'Vikram Singh', type: 'Top Spender', spend: '₹65,000', spendValue: 65000, visits: 3 },
  { id: 105, name: 'Priya Sharma', type: 'New', spend: '₹2,000', spendValue: 2000, visits: 1 },
];

export const REDEMPTIONS_DATA = [
  { id: 1, customer: 'Ramesh Gupta', date: 'Oct 22, 2025', count: 3, save: '₹120' },
  { id: 2, customer: 'Suresh Patil', date: 'Oct 23, 2025', count: 1, save: '₹450' },
  { id: 3, customer: 'Anita Desai', date: 'Oct 24, 2025', count: 5, save: '₹80' },
  { id: 4, customer: 'Vikram Singh', date: 'Oct 25, 2025', count: 2, save: '₹200' },
];