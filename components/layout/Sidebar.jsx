import React from 'react'
import { 
    LayoutDashboard, Users, ShoppingCart, Package, 
    BarChart3, User, Settings, Tag, FileText, Printer, LogOut 
  } from 'lucide-react';
  import { NavLink } from 'react-router-dom';

function Sidebar() {

    const menuItems = [
        {id: 1, icon: LayoutDashboard, label: 'Dashboard', path:'/'},
        {id: 2, icon: Users, label: 'Parties', path:'/parties'},
        {id: 3, icon: ShoppingCart, label: 'New Sale', path:'/new-sale'},
        {id: 4, icon: Package, label: 'Inventory', path:'/inventory'},
        {id: 5, icon: BarChart3, label: 'Reports', path:'/reports'},
    ]
    const settingsItems = [
        { id: 6, icon: User, label: 'Profile', path: '/profile' },
        { id: 7, icon: Settings, label: 'Properties', path: '/properties' },
        { id: 8, icon: Tag, label: 'Offers', path: '/offers' },
        { id: 9, icon: FileText, label: 'Templates', path: '/templates' },
        { id: 10, icon: Printer, label: 'Printer', path: '/printer' },
    ]

    const SidebarLink = ({item}) => (
        <li>
            <NavLink
            to={item.path}
            className={({isActive}) => ` flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <item.icon size={20}/>
                <span>{item.label}</span>
            </NavLink>
        </li>
    )
  return (
    <div className='w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 flex flex-col '>
        <div className='p-6 border-b-2 border-gray-100'>
            <h2 className='text-lg font-bold text-gray-800'>Gurudev Kirana Store</h2>
            <p className='text-xs text-gray-400 mt-1'>Digital Ledger</p>
        </div>

        <div className='px-6 py-3 border-b-2 border-gray-100 flex flex-col gap-3'>
            <div className='bg-green-50 p-3 rounded-lg border border-green-100'>
                <p className='text-xs text-green-600 font-medium mb-1'>To Receive</p>
                <p className='text-lg font-medium text-green-700'>$45,240</p>
            </div>
            <div className='bg-red-50 p-3 rounded-lg border border-red-100'>
                <p className='text-xs text-red-600 font-medium mb-1'>To Pay</p>
                <p className='text-lg font-medium text-red-700'>$17,950</p>
            </div>
        </div>

    <div className='flex-1 px-4 py-2 space-y-6 overflow-y-auto scrollbar-hover min-h-0'>
        <div>
            <p className='px-4 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider'>Main Menu</p>
            <ul>
                {menuItems.map((item) => (
                    <SidebarLink key={item.id} item={item} />
                ))}
            </ul>
        </div>

        <div>
            <p className='px-4 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider'>Settings</p>
            <ul>
                {settingsItems.map((item) => (
                    <SidebarLink key={item.id} item={item}/>
                ))}
            </ul>
        </div>
        </div>
        <div className='p-4 border-t-2 border-gray-100'>
            <button className='flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors'>
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>
        
    </div>
  )
}
export default Sidebar