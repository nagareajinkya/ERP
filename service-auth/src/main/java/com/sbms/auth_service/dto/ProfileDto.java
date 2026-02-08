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

    // Profile Pic
    private String profilePicUrl;
    private String signatureUrl;
    private String stampUrl;
    
    // Preferences
    private String invoicePrefix;
    private boolean alwaysShowPaymentQr;
    
    // Verification
    private String verificationPassword;
}
