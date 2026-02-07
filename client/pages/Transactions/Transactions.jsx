import React from 'react';
import { TransactionsProvider } from './context/TransactionsContext';
import TransactionsHeader from './components/TransactionsHeader';
import TransactionsFilters from './components/TransactionsFilters';
import TransactionsTable from './components/TransactionsTable';
import ViewTransactionModal from './components/ViewTransactionModal';
import TransactionsFooter from './components/TransactionsFooter';


const Transactions = () => {
  return (
    <TransactionsProvider>
      <div className="min-h-screen bg-gray-50/50 p-6 pb-0 font-sans">
        <TransactionsHeader />
        <TransactionsFilters />
        <TransactionsTable />
        <ViewTransactionModal />
        <TransactionsFooter />
      </div>
    </TransactionsProvider>
  );
};

export default Transactions;
