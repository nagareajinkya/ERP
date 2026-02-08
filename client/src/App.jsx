import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';

// Lazy load components
const Dashboard = lazy(() => import('./../pages/Dashboard/Dashboard'));
const Parties = lazy(() => import('../pages/Parties/Parties'));
const NewTransaction = lazy(() => import('../pages/NewTransactions/NewTransactions'));
const NewSettlement = lazy(() => import('../pages/NewSettlement/NewSettlement'));
const Inventory = lazy(() => import('../pages/Inventory/Inventory'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Properties = lazy(() => import('../pages/Properties/Properties'));
const Offers = lazy(() => import('../pages/Offers/Offers'));
const Login = lazy(() => import('../pages/Login/Login'));
const Transactions = lazy(() => import('../pages/Transactions/Transactions'));
const Templates = lazy(() => import('../pages/Templates/Templates'));
const Printer = lazy(() => import('../pages/Printer/Printer'));
const BillPreview = lazy(() => import('../pages/BillPreview/BillPreview'));

import { AuthProvider } from '../context/AuthContext';
import { UIProvider } from '../context/UIContext';

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Suspense fallback={<PageLoader />}>
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
              <Route path="/bill-preview" element={<BillPreview />} />
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
        </Suspense>

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