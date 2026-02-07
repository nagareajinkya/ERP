import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../src/api';
import { useAuth } from './AuthContext';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const { user, token } = useAuth();

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Sidebar Stats (To Receive / To Pay)
    const [sidebarStats, setSidebarStats] = useState({ toReceive: 0, toPay: 0 });

    useEffect(() => {
        localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    // Fetch stats when user/business is available
    useEffect(() => {
        let mounted = true;

        const fetchStats = async () => {
            if (user && user.businessId && token) {
                try {
                    const statsRes = await api.get('/trading/stats');
                    if (statsRes.data && mounted) {
                        setSidebarStats({
                            toReceive: statsRes.data.toReceive ?? 0,
                            toPay: statsRes.data.toPay ?? 0,
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch sidebar stats:", err);
                }
            }
        };

        fetchStats();

        return () => { mounted = false };
    }, [user, token]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    const value = {
        isSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        sidebarStats,
        refreshStats: () => { /* Logic to re-fetch stats if needed */ }
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
