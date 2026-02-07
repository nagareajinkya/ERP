import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CollapsedSidebar from './CollapsedSidebar';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AuthenticatedLayout = () => {
    const { token, user, loading } = useAuth();
    const { isSidebarOpen, closeSidebar, openSidebar, sidebarStats } = useUI();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {isSidebarOpen ? (
                <Sidebar
                    isOpen={true}
                    toggle={closeSidebar}
                    userData={user}
                    stats={sidebarStats}
                />
            ) : (
                <CollapsedSidebar
                    toggle={openSidebar}
                />
            )}

            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
