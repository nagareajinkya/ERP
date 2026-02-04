package com.sbms.auth_service.dto;

import lombok.Data;

@Data
public class ProfileDto {
    // User Details
    private String fullName;
    private String phone;
    private String email;
    
    // Business Details
    private String businessName;
    private String gstin;
    private String address; // Street
    private String city;
    private String state;
    private String pincode;
    
    // Banking
    private String upiId;
    private String accountName;
    private String accountNumber;
    private String ifsc;
    
    // Preferences
    private String invoicePrefix;
    private boolean notifySales;
    private boolean notifyPayments;
    private boolean notifyLowStock;
}
