import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CollapsedSidebar from './CollapsedSidebar';
import api from '../../src/api';

const AuthenticatedLayout = () => {
    const token = localStorage.getItem('token');
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ toReceive: 0, toPay: 0 });

    // helper: decode JWT payload safely
    const decodeJwtPayload = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            let profile = null;
            try {
                const res = await api.get('/auth/me');
                if (res?.data) profile = res.data;
            } catch (e) { }

            if (!profile) {
                const stored = localStorage.getItem('user');
                if (stored) {
                    try { profile = JSON.parse(stored); } catch (e) { profile = null; }
                }
            }

            if (!profile && token) {
                if (token.split('.').length === 3) {
                    profile = decodeJwtPayload(token);
                }
            }

            if (mounted && profile) {
                setUserData(profile);
                if (profile.businessId) {
                    try {
                        const statsRes = await api.get('/trading/stats');
                        if (statsRes.data && mounted) {
                            setStats({
                                toReceive: statsRes.data.toReceive ?? 0,
                                toPay: statsRes.data.toPay ?? 0
                            });
                        }
                    } catch (err) {
                        console.error("Failed to fetch sidebar stats:", err);
                    }
                }
            }
        })();

        return () => { mounted = false };
    }, [token]);


    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {isSidebarOpen ? (
                <Sidebar
                    isOpen={true}
                    toggle={() => setIsSidebarOpen(false)}
                    userData={userData}
                    stats={stats}
                />
            ) : (
                <CollapsedSidebar
                    toggle={() => setIsSidebarOpen(true)}
                />
            )}

            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
