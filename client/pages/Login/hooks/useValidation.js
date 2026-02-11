import { useState } from 'react';

// List of valid Indian states
export const VALID_INDIAN_STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
    'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
    'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
    'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const useValidation = () => {
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validation functions
    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const validatePhone = (phone) => {
        if (!phone) return 'Phone number is required';
        if (phone.length !== 10) return 'Phone number must be 10 digits';
        if (!/^[6-9]\d{9}$/.test(phone)) return 'Please enter a valid Indian mobile number';
        return '';
    };

    const validateRequired = (value, fieldName) => {
        if (!value || value.trim() === '') return `${fieldName} is required`;
        return '';
    };


    const validateState = (state) => {
        if (!state || state.trim() === '') return 'State is required';
        if (!VALID_INDIAN_STATES.includes(state)) {
            return 'Please select a valid state from the dropdown';
        }
        return '';
    };

    // Handle field blur
    const handleBlur = (fieldName, validateFn) => {
        setTouched({ ...touched, [fieldName]: true });
        if (validateFn) {
            validateFn(fieldName);
        }
    };

    // Validate individual field
    const validateField = (fieldName, value, mode = 'login') => {
        let error = '';
        const errors = { ...fieldErrors };

        switch (fieldName) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'phone':
                if (mode === 'signup') error = validatePhone(value);
                break;
            case 'storeName':
                if (mode === 'signup') error = validateRequired(value, 'Store name');
                break;
            case 'ownerName':
                if (mode === 'signup') error = validateRequired(value, 'Owner name');
                break;
            case 'bizState':
                if (mode === 'signup') error = validateState(value);
                break;
            default:
                break;
        }

        if (error) {
            errors[fieldName] = error;
        } else {
            delete errors[fieldName];
        }

        setFieldErrors(errors);
        return error === '';
    };

    // Validate entire form
    const validateForm = (formData, mode = 'login') => {
        const errors = {};

        if (mode === 'login') {
            const emailError = validateEmail(formData.email);
            const passwordError = validatePassword(formData.password);

            if (emailError) errors.email = emailError;
            if (passwordError) errors.password = passwordError;
        } else {
            const storeError = validateRequired(formData.storeName, 'Store name');
            const ownerError = validateRequired(formData.ownerName, 'Owner name');
            const phoneError = validatePhone(formData.phone);
            const emailError = validateEmail(formData.email);
            const passwordError = validatePassword(formData.password);
            const stateError = validateState(formData.bizState);

            if (storeError) errors.storeName = storeError;
            if (ownerError) errors.ownerName = ownerError;
            if (phoneError) errors.phone = phoneError;
            if (emailError) errors.email = emailError;
            if (passwordError) errors.password = passwordError;
            if (stateError) errors.bizState = stateError;
        }

        setFieldErrors(errors);
        setTouched({
            email: true,
            password: true,
            phone: true,
            storeName: true,
            ownerName: true,
            bizState: true
        });

        return Object.keys(errors).length === 0;
    };

    const resetValidation = () => {
        setFieldErrors({});
        setTouched({});
    };

    return {
        fieldErrors,
        touched,
        handleBlur,
        validateField,
        validateForm,
        resetValidation,
        setTouched
    };
};
