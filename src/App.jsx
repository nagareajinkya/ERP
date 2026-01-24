import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Dashboard from './../pages/Dashboard/Dashboard';
import Sidebar from '../components/layout/Sidebar';
import Parties from '../pages/Parties/Parties';
import NewTransaction from '../pages/Transactions/NewTransactions';
import Inventory from '../pages/Inventory/Inventory';
import Reports from '../pages/Reports/Reports';
import Profile from '../pages/Profile/Profile';
import Properties from '../pages/Properties/Properties';
import Offers from '../pages/Offers/Offers';
import Login from '../pages/Login/Login';
import Transactions from '../pages/Transactions/Transactions';
import Templates from '../pages/Templates/Templates';
import Printer from '../pages/Printer/Printer';

// 1. Create a Layout component for the main app
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar />
      <div className='flex-1 ml-64'>
        {/* The <Outlet /> renders whatever child route is currently active */}
        <Outlet /> 
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* 2. Public Route (No Sidebar) */}
      <Route 
        path="/login" 
        element={<Login />} 
      />

      {/* 3. Protected/Main Routes (With Sidebar) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/parties" element={<Parties />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/new-sale" element={<NewTransaction type="sale" />} />
        <Route path="/new-purchase" element={<NewTransaction type="purchase" />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/printer" element={<Printer />} />
      </Route>

      {/* Fallback: Redirect unknown URLs to Home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;