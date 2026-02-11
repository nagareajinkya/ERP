import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../src/api';

export const useAuthForm = () => {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle login submission
    const handleLogin = async (email, password) => {
        try {
            setLoading(true);
            setError('');

            const res = await api.post('/auth/login', { identifier: email, password });
            const { token, ...user } = res.data;

            if (token) {
                authLogin(token, user);
                navigate('/Dashboard');
                return true;
            } else {
                setError('Login failed: no token returned');
                return false;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';

            if (err.response?.status === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (err.response?.status === 403) {
                setError('Invalid email or password. Please try again.');
            } else if (err.response?.status === 404) {
                setError('No account found with this email. Please sign up.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (err.response?.data?.message) {
                // Use server-provided error message if available
                setError(errorMessage);
            } else if (!err.response) {
                setError('Network error. Please check your internet connection.');
            } else {
                setError(errorMessage);
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Handle signup registration
    const handleCompleteProfile = async (formData) => {
        try {
            setLoading(true);
            setError('');

            const payload = {
                fullName: formData.ownerName,
                email: formData.email,
                phoneNumber: `+91${formData.phone}`,
                password: formData.password,
                businessName: formData.storeName,
                addressState: formData.bizState,
                gstin: formData.gstin || null,
                upiId: formData.upiId || null
            };

            const res = await api.post('/auth/register', payload);
            const { token, ...user } = res.data;

            if (token) {
                authLogin(token, user);
                navigate('/Dashboard');
                return true;
            } else {
                setError('Registration successful but no token received. Please login.');
                return false;
            }
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';

            if (err.response?.status === 409) {
                setError('An account with this email or phone already exists. Please login.');
            } else if (err.response?.status === 400) {
                setError(err.response?.data?.message || 'Invalid registration data. Please check all fields.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (err.response?.data?.message) {
                // Use server-provided error message if available
                setError(errorMessage);
            } else if (!err.response) {
                setError('Network error. Please check your internet connection.');
            } else {
                setError(errorMessage);
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Handle profile update (GSTIN/UPI) after registration
    const handleProfileUpdateSubmit = async (gstin, upiId) => {
        try {
            setLoading(true);
            setError('');

            await api.put('/auth/profile', { gstin, upiId });
            navigate('/Dashboard');
            return true;
        } catch (err) {
            console.error("Profile update error:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError('');

    return {
        loading,
        error,
        handleLogin,
        handleCompleteProfile,
        handleProfileUpdateSubmit,
        clearError
    };
};
