export const INITIAL_TEMPLATES = [
    { id: 1, category: 'Payment', name: 'Standard Reminder', text: 'Namaste {customer_name}, this is a friendly reminder from {shop_name}. Your balance of ₹{pending_amount} is pending. Please settle it soon.', type: 'whatsapp' },
    { id: 2, category: 'Order', name: 'Pickup Ready', text: 'Great news {customer_name}! Your order #{order_id} is ready for pickup at {shop_name}. See you soon!', type: 'both' },
  ];
  
export const TEMPLATE_PARTIES = [
        { id: 101, name: 'Ramesh Gupta', phone: '9876543210', balance: 4500 },
        { id: 102, name: 'Anita Desai', phone: '9988776655', balance: 0 },
        { id: 103, name: 'Suresh Patil', phone: '8877665544', balance: 12500 },
  ];
  