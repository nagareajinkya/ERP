export const CHART_DATA = {
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
  
  export const RECENT_TRANSACTIONS = [
    { id: 'TRX-1092', customer: 'Ramesh Gupta', type: 'Sale', amount: 1250, time: '10 mins ago', status: 'Paid' },
    { id: 'TRX-1091', customer: 'Walk-in', type: 'Sale', amount: 450, time: '45 mins ago', status: 'Paid' },
    { id: 'TRX-1090', customer: 'Anita Desai', type: 'Sale', amount: 3200, time: '2 hours ago', status: 'Credit' },
    { id: 'PUR-0042', customer: 'Metro Wholesalers', type: 'Purchase', amount: 15000, time: '5 hours ago', status: 'Paid' },
  ];
  
  export const LOW_STOCK_ITEMS = [
    { id: 1, name: 'Maggi Noodles', current: 12, min: 20, unit: 'pkt' },
    { id: 2, name: 'Tata Salt', current: 5, min: 15, unit: 'kg' },
    { id: 3, name: 'Coca Cola', current: 8, min: 24, unit: 'ltr' },
  ];