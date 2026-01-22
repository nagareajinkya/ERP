import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './../pages/Dashboard/Dashboard';
import  Sidebar  from '../components/layout/Sidebar';

// Placeholder components for testing (Delete these later when you create real files)
const Login = () => <div className="p-10 text-center"><h1>Login Page</h1></div>;
const Inventory = () => <div className="p-10 text-center"><h1>Inventory Page</h1></div>;

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar />
      <div className='flex-1 ml-64'>
      <Routes>
        <Route 
        path="/" 
        element={<Dashboard />}
        />

        <Route
        path="/login"
        element={<Login />}
        />

        <Route
        path="/inventory"
        element={<Inventory />}
        />

        {/* Fallback: Redirect unknown URLs to Home */}
        <Route 
        path="*"
        element={<Navigate to="/"/>}
        />
      </Routes>
    </div>
    </div>
  );
}

export default App;