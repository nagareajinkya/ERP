import React from 'react';
import {
    LayoutDashboard, Users, ShoppingCart, ShoppingBag, Package,
    BarChart3, User, Settings, SwatchBook, Tag, FileText, Printer, LogOut,
    ChevronLeft, History, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

function Sidebar({ isOpen = true, toggle, userData, stats }) {

    const menuItems = [
        { id: 1, icon: LayoutDashboard, label: 'Dashboard', path: '/Dashboard' },
        { id: 2, icon: Users, label: 'Parties', path: '/parties' },
        { id: 3, icon: ShoppingCart, label: 'New Sale', path: '/new-sale' },
        { id: 4, icon: ShoppingBag, label: 'New Purchase', path: '/new-purchase' },
        { id: 5, icon: History, label: 'Transactions', path: '/transactions' },
        { id: 6, icon: ArrowDownLeft, label: 'New Receipt', path: '/new-receipt' },
        { id: 7, icon: ArrowUpRight, label: 'New Payment', path: '/new-payment' },
        { id: 8, icon: Package, label: 'Inventory', path: '/inventory' },
        { id: 9, icon: BarChart3, label: 'Reports', path: '/reports' },
    ];

    const settingsItems = [
        { id: 10, icon: User, label: 'Profile', path: '/profile' },
        { id: 11, icon: SwatchBook, label: 'Categories & Units', path: '/properties' },
        { id: 12, icon: Tag, label: 'Offers', path: '/offers' },
        { id: 13, icon: FileText, label: 'Templates', path: '/templates' },
        { id: 14, icon: Printer, label: 'Printer & Invoice', path: '/printer' },
    ];

    const fmtMoney = (val) => {
        if (val === undefined || val === null) return null;
        const num = Number(val);
        if (Number.isNaN(num)) return String(val);
        return '₹' + num.toLocaleString('en-IN');
    };

    const moneyStats = (() => {
        const toReceive = stats?.toReceive ?? 0;
        const toPay = stats?.toPay ?? 0;

        return [
            { id: 1, label: 'To Receive', amount: fmtMoney(toReceive), bg: 'bg-green-50', border: 'border-green-100', textColor: 'text-green-600' },
            { id: 2, label: 'To Pay', amount: fmtMoney(toPay), bg: 'bg-red-50', border: 'border-red-100', textColor: 'text-red-600' }
        ];
    })();

    const businessName = userData?.businessName ?? userData?.business ?? userData?.storeName ?? userData?.name;
    const ownerName = userData?.fullName ?? userData?.ownerName ?? userData?.name ?? null;

    const SidebarLink = ({ item }) => (
        <li>
            <NavLink
                to={item.path}
                className={({ isActive }) => `group flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-600 translate-x-1 active' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
            >
                <div className="relative flex items-center gap-3 w-full">
                    <item.icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.label}</span>
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-600 opacity-0 group-[.active]:opacity-100" />
                </div>
            </NavLink>
        </li>
    );

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 flex flex-col z-40 transition-none">

            {/* Header */}
            <div className='p-6 border-b-2 border-gray-100 z-10 bg-white flex justify-between items-center'>
                <div>
                    <h2 className='text-lg font-bold text-gray-800'>{businessName}</h2>
                    <p className='text-xs text-gray-400 mt-1'>{ownerName ? ownerName : 'Digital Ledger'}</p>
                </div>
                <button
                    onClick={toggle}
                    className="p-2 rounded-lg bg-slate-50 text-slate-500 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all duration-200 group"
                    title="Collapse"
                >
                    <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
                </button>
            </div>

            {/* ANIMATED CURTAIN SECTION */}
            <div className="px-6 flex flex-col gap-2 border-gray-100 py-4 border-b-2">
                {moneyStats.map((stat) => (
                    <div key={stat.id} className={`${stat.bg} ${stat.border} p-3 rounded-lg border min-w-0`}>
                        <p className={`text-xs font-medium mb-1 ${stat.textColor} truncate`}>
                            {stat.label}
                        </p>
                        <p className={`text-lg font-bold ${stat.textColor} truncate`}>
                            {stat.amount}
                        </p>
                    </div>
                ))}
            </div>

            {/* Menu Links */}
            <div className='flex-1 px-4 py-4 space-y-3 overflow-y-auto min-h-0 scrollbar-hover'>
                <div>
                    <p className='px-4 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider'>Main Menu</p>
                    <ul className='space-y-1'>
                        {menuItems.map((item) => (
                            <SidebarLink key={item.id} item={item} />
                        ))}
                    </ul>
                </div>

                <div>
                    <div className="mx-4 mb-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <p className='px-4 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider'>Settings</p>
                    <ul className='space-y-1'>
                        {settingsItems.map((item) => (
                            <SidebarLink key={item.id} item={item} />
                        ))}
                    </ul>
                </div>
            </div>

            {/* Logout Button */}
            <div className='p-4 border-t-2 border-gray-100 bg-white z-10'>
                <button
                    onClick={handleLogout}
                    className='group flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-all duration-200 active:scale-[0.97]'
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

        </div>
    );
}

export default Sidebar;
