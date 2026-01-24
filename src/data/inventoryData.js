export const INITIAL_PRODUCTS = [
  { id: 'PRD-001', sku: 'RICE-001', name: 'Basmati Rice (Premium)', category: 'Grains', qty: 45, unit: 'kg', buyPrice: 90, sellPrice: 120, minStock: 15, gstRate: 5, hsn: '1006' },
  { id: 'PRD-002', sku: 'SALT-001', name: 'Tata Salt', category: 'Groceries', qty: 5, unit: 'kg', buyPrice: 20, sellPrice: 28, minStock: 10, gstRate: 0, hsn: '2501' },
  { id: 'PRD-003', sku: 'BTR-001', name: 'Amul Butter', category: 'Dairy', qty: 12, unit: 'pc', buyPrice: 48, sellPrice: 56, minStock: 20, gstRate: 12, hsn: '0405' },
  { id: 'PRD-004', sku: 'MAG-001', name: 'Maggi Noodles', category: 'Snacks', qty: 85, unit: 'pkt', buyPrice: 11, sellPrice: 14, minStock: 30, gstRate: 12, hsn: '1902' },
];

export const INITIAL_CATEGORIES = ['Beverages', 'Dairy', 'Grains', 'Groceries', 'Personal Care', 'Snacks'].sort();
export const INITIAL_UNITS = ['box', 'kg', 'ltr', 'pc', 'pkt'].sort();
export const GST_PRESETS = [0, 5, 12, 18, 28];

export const ADJUSTMENT_REASONS = [
  { label: 'Damage / Theft (Loss)', value: 'Loss' },
  { label: 'Expired (Write-off)', value: 'Expired-Loss' },
  { label: 'Return to Vendor (Refund)', value: 'Return' },
  { label: 'Internal Use', value: 'Internal' }
];