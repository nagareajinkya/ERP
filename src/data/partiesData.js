export const MOCK_PARTIES = [
  { id: 1, type: 'customer', name: 'Ramesh Gupta', phone: '9876543210', city: 'Pune', gstin: '', balance: 4500, balanceType: 'receive', lastVisit: '2024-01-23', tags: ['Regular'], notes: 'Prefers evening delivery.' },
  { id: 4, type: 'supplier', name: 'Metro Wholesalers', phone: '7766554433', city: 'Thane', gstin: '27QWERTY9999P1Z2', balance: 18000, balanceType: 'pay', lastVisit: '2024-01-15', tags: ['Grains'], notes: 'Credit cycle: 15 days' },
];

export const MOCK_LEDGER = [
  { id: 'TRX-101', date: '24 Jan 2024', type: 'Sale', amount: 1500, paid: 500, due: 1000 },
];