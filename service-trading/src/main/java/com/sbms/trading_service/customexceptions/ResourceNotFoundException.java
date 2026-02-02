package com.sbms.trading_service.customexceptions;

public class ResourceNotFoundException extends RuntimeException {
	public ResourceNotFoundException(String msg) {
		super(msg);
	}
}
