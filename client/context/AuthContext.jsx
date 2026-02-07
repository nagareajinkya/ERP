import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../src/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Helper: Decode JWT Payload
    const decodeJwtPayload = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        // You might want to navigate here or let the component handle it
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/');
    };

    const fetchUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            if (res?.data) {
                setUser(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Fallback to stored user or token decoding if API fails but token exists
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch (e) { /* ignore */ }
            } else if (token) {
                const decoded = decodeJwtPayload(token);
                if (decoded) setUser(decoded);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [token]);

    const value = {
        token,
        user,
        loading,
        login,
        logout,
        checkAuth: fetchUser, // Expose if manual re-check needed
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
