// -----------------------------------------------------------------------
// IDENTITY DOMAIN (Users & Businesses)
// -----------------------------------------------------------------------

Table Businesses {
  business_id UUID [pk]
  business_name VARCHAR(100)
  gstin VARCHAR(50) [note: "For Tax Invoices"]
  
  // Address
  address_street VARCHAR(255)
  address_city VARCHAR(100)
  address_state VARCHAR(100)
  address_pincode VARCHAR(20)
  
  // Banking & UPI
  bank_account_name VARCHAR(100)
  bank_account_no VARCHAR(50)
  bank_ifsc VARCHAR(20)
  upi_id VARCHAR(100) [note: "For QR Code Generation"]
  
  // Branding & Docs
  signature_url VARCHAR(500) [note: "S3 Link for Invoice Footer"]
  stamp_url VARCHAR(500) [note: "S3 Link for Receipts"]
  invoice_prefix VARCHAR(20) [note: "Ex: INV-2026-"]
  
  // Preferences
  notify_sales BOOLEAN [default: true]
  notify_payments BOOLEAN [default: true]
  notify_low_stock BOOLEAN [default: false]
  
  created_at TIMESTAMP
}

Table Users {
  user_id UUID [pk]
  business_id UUID [unique, ref: - Businesses.business_id]
  full_name VARCHAR(100)
  email VARCHAR(100) [unique]
  phone_number VARCHAR(20)
  password_hash VARCHAR(255)
  profile_pic_url VARCHAR(500) [note: "S3 Link"]
}

// -----------------------------------------------------------------------
// CRM DOMAIN (Customers & Suppliers)
// -----------------------------------------------------------------------

Table Parties {
  party_id UUID [pk]
  business_id UUID [ref: > Businesses.business_id]
  name VARCHAR(100)
  phone VARCHAR(20)
  party_type VARCHAR(20) [note: "CUSTOMER or SUPPLIER"]
  current_balance DECIMAL(12,2) [note: "Positive = Receivable, Negative = Payable"]
  city VARCHAR(100)
  gstin VARCHAR(50)
}

// -----------------------------------------------------------------------
// INVENTORY DOMAIN (Products)
// -----------------------------------------------------------------------

Table Categories {
  category_id UUID [pk]
  business_id UUID [ref: > Businesses.business_id]
  name VARCHAR(100)
}

Table Products {
  product_id UUID [pk]
  business_id UUID [ref: > Businesses.business_id]
  category_id UUID [ref: > Categories.category_id]
  barcode VARCHAR(50)
  product_name VARCHAR(200)
  mrp DECIMAL(10,2)
  selling_price DECIMAL(10,2)
  current_stock DECIMAL(10,3) [note: "Fractional allowed for kg/ltr"]
  hsn_code VARCHAR(20)
  gst_rate DECIMAL(5,2)
}

// -----------------------------------------------------------------------
// SALES DOMAIN (Invoices)
// -----------------------------------------------------------------------

Table Invoices {
  invoice_id UUID [pk]
  business_id UUID [ref: > Businesses.business_id]
  party_id UUID [null, ref: > Parties.party_id] // Nullable for cash customers
  invoice_number VARCHAR(50)
  sub_total DECIMAL(12,2)
  discount_amount DECIMAL(12,2)
  tax_total DECIMAL(12,2)
  grand_total DECIMAL(12,2)
  payment_mode VARCHAR(20) [note: "CASH, UPI, CREDIT"]
  created_at TIMESTAMP
}

Table Invoice_Items {
  item_id UUID [pk]
  invoice_id UUID [ref: > Invoices.invoice_id]
  product_id UUID [ref: > Products.product_id]
  quantity DECIMAL(10,3)
  unit_price DECIMAL(10,2)
  total_price DECIMAL(10,2)
}