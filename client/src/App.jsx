import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';

import Dashboard from './../pages/Dashboard/Dashboard';
import Parties from '../pages/Parties/Parties';
import NewTransaction from '../pages/NewTransactions/NewTransactions';
import NewSettlement from '../pages/NewSettlement/NewSettlement';
import Inventory from '../pages/Inventory/Inventory';

import Profile from '../pages/Profile/Profile';
import Properties from '../pages/Properties/Properties';
import Offers from '../pages/Offers/Offers';
import Login from '../pages/Login/Login';
import Transactions from '../pages/Transactions/Transactions';
import Templates from '../pages/Templates/Templates';
import Printer from '../pages/Printer/Printer';

import { AuthProvider } from '../context/AuthContext';
import { UIProvider } from '../context/UIContext';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Routes>
          {/* 2. Public Route (No Sidebar) */}
          <Route
            path="/"
            element={<Login />}
          />
          <Route
            path="/login"
            element={<Login />}
          />

          {/* 3. Protected/Main Routes (With Sidebar) */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/parties" element={<Parties />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/new-sale" element={<NewTransaction type="sale" />} />
            <Route path="/new-purchase" element={<NewTransaction type="purchase" />} />
            <Route path="/new-receipt" element={<NewSettlement type="receipt" />} />
            <Route path="/new-payment" element={<NewSettlement type="payment" />} />

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

        {/* Global Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </UIProvider>
    </AuthProvider>
  );
}

export default App;