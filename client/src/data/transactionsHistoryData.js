export const MOCK_TRANSACTIONS = [
    { 
      id: 'TRX-1001', date: '2024-01-24', time: '10:30 AM', 
      type: 'Sale', party: 'Ramesh Gupta', paymentMode: 'Cash', 
      amount: 1250, status: 'Paid', items: 3,
      details: [
        { name: 'Basmati Rice', qty: 5, rate: 120, total: 600 },
        { name: 'Tata Salt', qty: 2, rate: 20, total: 40 },
        { name: 'Sugar', qty: 10, rate: 61, total: 610 },
      ]
    },
    { 
      id: 'TRX-1002', date: '2024-01-24', time: '11:15 AM', 
      type: 'Sale', party: 'Walk-in Customer', paymentMode: 'UPI', 
      amount: 450, status: 'Paid', items: 1,
      details: [
        { name: 'Amul Butter', qty: 5, rate: 90, total: 450 },
      ]
    },
    { 
      id: 'PUR-5001', date: '2024-01-23', time: '04:00 PM', 
      type: 'Purchase', party: 'Metro Wholesalers', paymentMode: 'Bank', 
      amount: 15000, status: 'Partial', items: 12, paidAmount: 5000,
      details: [
        { name: 'Basmati Rice (Sack)', qty: 10, rate: 900, total: 9000 },
        { name: 'Oil Cans', qty: 5, rate: 1200, total: 6000 },
      ]
    },
    { 
      id: 'ADJ-001', date: '2024-01-23', time: '06:30 PM', 
      type: 'Adjustment', party: 'Store (Internal)', paymentMode: 'N/A', 
      amount: 240, status: 'Loss', items: 1, reason: 'Damage',
      details: [
        { name: 'Milk Packets (Leaked)', qty: 4, rate: 60, total: 240 },
      ]
    },
    { 
      id: 'TRX-0998', date: '2024-01-22', time: '02:00 PM', 
      type: 'Sale', party: 'Suresh Tea Stall', paymentMode: 'Credit', 
      amount: 2200, status: 'Unpaid', items: 5,
      details: [
        { name: 'Tea Powder', qty: 2, rate: 400, total: 800 },
        { name: 'Sugar', qty: 20, rate: 45, total: 900 },
        { name: 'Paper Cups', qty: 5, rate: 100, total: 500 },
      ]
    },
  ];