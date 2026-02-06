import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, ShoppingCart, ShoppingBag, Package,
    BarChart3, User, Settings, SwatchBook, Tag, FileText, Printer, LogOut,
    ChevronRight, History
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import api from '../../src/api';

const CollapsedSidebar = ({ toggle }) => {
    const [hoveredInfo, setHoveredInfo] = useState(null);
    const [userData, setUserData] = useState({ name: '', avatar: null });
    const [loading, setLoading] = useState(true);

    // Fetch user data from backend on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/auth/me/collapsed-sidebar');
                setUserData({
                    name: response.data.name || 'User',
                    avatar: response.data.profilePicUrl || null
                });
            } catch (error) {
                console.error("Error fetching user data", error);
                setUserData({ name: 'User', avatar: null });
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, []);

    // Helper to get initials (e.g., "John Doe" -> "JD")
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .filter(Boolean) // Remove empty spaces
            .map(part => part[0])
            .join('')
            .substring(0, 2) // Limit to 2 characters
            .toUpperCase();
    };

    const menuItems = [
        { id: 1, icon: LayoutDashboard, label: 'Dashboard', path: '/Dashboard' },
        { id: 2, icon: Users, label: 'Parties', path: '/parties' },
        { id: 3, icon: ShoppingCart, label: 'New Sale', path: '/new-sale' },
        { id: 4, icon: ShoppingBag, label: 'New Purchase', path: '/new-purchase' },
        { id: 5, icon: Package, label: 'Inventory', path: '/inventory' },
        { id: 6, icon: History, label: 'Transactions', path: '/transactions' },
        { id: 7, icon: BarChart3, label: 'Reports', path: '/reports' },
    ];

    const settingsItems = [
        { id: 8, icon: User, label: 'Profile', path: '/profile' },
        { id: 9, icon: SwatchBook, label: 'Categories', path: '/properties' },
        { id: 10, icon: Tag, label: 'Offers', path: '/offers' },
        { id: 11, icon: FileText, label: 'Templates', path: '/templates' },
        { id: 12, icon: Printer, label: 'Printer', path: '/printer' },
    ];

    const IconLink = ({ item }) => (
        <NavLink
            to={item.path}
            onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredInfo({ label: item.label, top: rect.top + (rect.height / 2) });
            }}
            onMouseLeave={() => setHoveredInfo(null)}
            className={({ isActive }) => `
                relative flex items-center justify-center w-10 h-10 mb-2 rounded-xl 
                transition-all duration-300 ease-out group
                ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'
                }
            `}
        >
            {({ isActive }) => (
                <>
                    <item.icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-transform duration-300 ${isActive ? 'scale-100' : 'group-hover:scale-110'}`}
                    />
                    {isActive && (
                        <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                    )}
                </>
            )}
        </NavLink>
    );

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <>
            <aside className="fixed top-0 left-0 h-screen w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-6 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300">

                {/* Expand Toggle */}
                <div className="shrink-0 mb-6 w-full flex justify-center">
                    <button
                        onClick={toggle}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all duration-200 group"
                    >
                        <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Menu */}
                <div className="flex-1 flex flex-col w-full items-center overflow-y-auto overflow-x-hidden scrollbar-hover px-2 space-y-6">
                    <div className="flex flex-col w-full items-center">
                        {menuItems.map(item => <IconLink key={item.id} item={item} />)}
                    </div>
                    <div className="w-8 h-[2px] bg-slate-100 rounded-full shrink-0"></div>
                    <div className="flex flex-col w-full items-center">
                        {settingsItems.map(item => <IconLink key={item.id} item={item} />)}
                    </div>
                </div>

                {/* Footer: Avatar & Logout */}
                <div className="mt-auto pt-4 w-full flex flex-col items-center gap-4">

                    {/* Dynamic Avatar */}
                    <div
                        className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-blue-200 transition-colors"
                        title={userData.name}
                    >
                        {userData.avatar ? (
                            <img
                                src={userData.avatar}
                                alt={userData.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-bold text-slate-500 select-none">
                                {getInitials(userData.name)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredInfo({ label: 'Logout', top: rect.top + (rect.height / 2) });
                        }}
                        onMouseLeave={() => setHoveredInfo(null)}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors duration-200"
                    >
                        <LogOut size={20} strokeWidth={2} />
                    </button>
                </div>
            </aside>

            {/* External Tooltip */}
            {hoveredInfo && (
                <div
                    className="fixed left-[80px] px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-xl z-[60] pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: hoveredInfo.top, transform: 'translateY(-50%)' }}
                >
                    {hoveredInfo.label}
                    <div className="absolute left-0 top-1/2 -translate-x-[4px] -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
            )}
        </>
    );
};

export default CollapsedSidebar;