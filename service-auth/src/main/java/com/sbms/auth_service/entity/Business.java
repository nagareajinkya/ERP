package com.sbms.auth_service.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "businesses")
@AttributeOverride(name = "id", column = @Column(name = "business_id"))
public class Business extends BaseEntity {
	@Column(name = "business_name", nullable = false, length = 100)
	private String businessName;
	@Column(length = 50)
	private String gstin;
	
	//Address Details
	@Column(name = "address_street", length = 25)
	private String addressStreet;
	@Column(name = "address_city", length = 25)
	private String addressCity;
	@Column(name = "address_state", nullable = false, length = 25)
    private String addressState;
	@Column(name = "address_pincode", length = 10)
    private String addressPincode;

    // --- Banking & UPI ---
	@Column(name = "bank_acccount_holder", length = 50)
    private String bankAccountName;
	@Column(name = "bank_account_no", length = 35)
    private String bankAccountNo;
	@Column(name = "bank_ifsc", length = 30)
    private String bankIfsc;
	@Column(name = "upi_id", length = 50)
    private String upiId;

    // --- Branding & Docs ---
	@Column(name = "authorized_signature_url")
    private String signatureUrl;
	@Column(name = "business_stamp_url")
    private String stampUrl;
	@Column(name = "invoice_prefix")
    private String invoicePrefix; // e.g., "INV-2026-"

    // --- Preferences ---
    @Column(name = "notify_sales", nullable = false)
    private boolean notifySales = true;

    @Column(name = "notify_payments", nullable = false)
    private boolean notifyPayments = true;

    @Column(name = "notify_low_stock", nullable = false)
    private boolean notifyLowStock = true;
}
