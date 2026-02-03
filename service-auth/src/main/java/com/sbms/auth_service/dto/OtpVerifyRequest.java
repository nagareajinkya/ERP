package com.sbms.auth_service.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private String phone;
    private String code;
}
