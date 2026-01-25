import React from 'react';
import { 
    LayoutDashboard, Users, ShoppingCart, ShoppingBag, Package, 
    BarChart3, User, Settings, SwatchBook, Tag, FileText, Printer, LogOut,
    History // <--- Imported History Icon
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

function Sidebar() {
    const location = useLocation();

    // Logic: Hide stats on Dashboard and Parties pages
    const hideStatsOnPaths = ['/', '/parties'];
    const shouldShowStats = !hideStatsOnPaths.includes(location.pathname);

    const menuItems = [
        {id: 1, icon: LayoutDashboard, label: 'Dashboard', path:'/'},
        {id: 2, icon: Users, label: 'Parties', path:'/parties'},
        {id: 3, icon: ShoppingCart, label: 'New Sale', path:'/new-sale'},
        {id: 4, icon: ShoppingBag, label: 'New Purchase', path:'/new-purchase'}, 
        {id: 5, icon: Package, label: 'Inventory', path:'/inventory'},
        {id: 6, icon: History, label: 'Transactions', path:'/transactions'}, // <--- Added Transactions Here
        {id: 7, icon: BarChart3, label: 'Reports', path:'/reports'},
    ];
    
    const settingsItems = [
        { id: 8, icon: User, label: 'Profile', path: '/profile' },
        { id: 9, icon: SwatchBook, label: 'Categories & Units', path: '/properties' },
        { id: 10, icon: Tag, label: 'Offers', path: '/offers' },
        { id: 11, icon: FileText, label: 'Templates', path: '/templates' },
        { id: 12, icon: Printer, label: 'Printer & Invoice', path: '/printer' },
    ];

    const moneyStats = [
        { 
            id: 1, 
            label: 'To Receive', 
            amount: '₹45,240', 
            bg: 'bg-green-50', 
            border: 'border-green-100',
            textColor: 'text-green-600' 
        },
        { 
            id: 2, 
            label: 'To Pay', 
            amount: '₹12,800', 
            bg: 'bg-red-50', 
            border: 'border-red-100',
            textColor: 'text-red-600' 
        }
    ];

    const SidebarLink = ({item}) => (
        <li>
            <NavLink
                to={item.path}
                className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <item.icon size={20}/>
                <span>{item.label}</span>
            </NavLink>
        </li>
    );

    return (
        <div className='w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 flex flex-col'>
            
            {/* Header */}
            <div className='p-6 border-b-2 border-gray-100 z-10 bg-white'>
                <h2 className='text-lg font-bold text-gray-800'>Gurudev Kirana Store</h2>
                <p className='text-xs text-gray-400 mt-1'>Digital Ledger</p>
            </div>

            {/* ANIMATED CURTAIN SECTION */}
            <div 
                className={`
                    px-6 flex flex-col gap-3 overflow-hidden transition-all duration-500 ease-in-out border-gray-100
                    ${shouldShowStats 
                        ? 'max-h-49 py-4 opacity-100 border-b-2'  // Curtain Down (Visible)
                        : 'max-h-0 py-0 opacity-0 border-b-0'     // Curtain Up (Hidden)
                    }
                `}
            >
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
            <div className='flex-1 px-4 py-4 space-y-6 overflow-y-auto min-h-0 scrollbar-hover'>
                <div>
                    <p className='px-4 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider'>Main Menu</p>
                    <ul className='space-y-1'>
                        {menuItems.map((item) => (
                            <SidebarLink key={item.id} item={item} />
                        ))}
                    </ul>
                </div>

                <div>
                    <p className='px-4 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider'>Settings</p>
                    <ul className='space-y-1'>
                        {settingsItems.map((item) => (
                            <SidebarLink key={item.id} item={item}/>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Logout Button */}
            <div className='p-4 border-t-2 border-gray-100 bg-white z-10'>
                <button className='flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors'>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
            
        </div>
    );
}

export default Sidebar;
