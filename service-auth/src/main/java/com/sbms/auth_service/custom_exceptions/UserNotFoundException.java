package com.sbms.auth_service.custom_exceptions;

public class UserNotFoundException extends RuntimeException {
	public UserNotFoundException(String msg) {
		super(msg);
	}

}
