import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AuthenticatedLayout = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            <Sidebar />
            <div className='flex-1 ml-64'>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
