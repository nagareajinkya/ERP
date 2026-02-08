import React from 'react';
import { NewTransactionProvider, useNewTransactionContext } from './context/NewTransactionContext';
import TransactionHeader from './components/header/TransactionHeader';
import ProductsTable from './components/products/ProductsTable';
import ProductMasterList from './components/products/ProductMasterList';
import OffersPanel from './components/offers/OffersPanel';
import TransactionFooter from './components/footer/TransactionFooter';
import WalkInModal from './components/modals/WalkInModal';
import ProductHistoryModal from './components/modals/ProductHistoryModal';
import PaymentQRModal from './components/modals/PaymentQRModal';

/**
 * NewTransaction Page - Refactored Version
 * Main component using Context provider pattern
 */
const NewTransactionContent = () => {
  const {
    showWalkInModal,
    setShowWalkInModal,
    setWalkInDetails,
    showProductHistory,
    closeProductHistory,
    selectedProductForHistory,
    productHistorySales,
    productHistoryPurchases,
    historyLoading,
    // QR Modal
    showQRModal,
    setShowQRModal,
    totals,
    paidAmount,
    userProfile
  } = useNewTransactionContext();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      {/* Header */}
      <TransactionHeader />

      {/* Body */}
      <div className="flex-1 grid grid-cols-10 gap-4 p-4 overflow-hidden">
        {/* Left Panel: Product Table */}
        <div className="col-span-7">
          <ProductsTable />
        </div>

        {/* Right Panel: Master List & Offers */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <ProductMasterList />
          <OffersPanel />
        </div>
      </div>

      {/* Footer */}
      <TransactionFooter />

      {/* Modals */}
      <WalkInModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        onSave={(details) => {
          setWalkInDetails(details);
          setShowWalkInModal(false);
        }}
      />
      <ProductHistoryModal
        isOpen={showProductHistory}
        onClose={closeProductHistory}
        product={selectedProductForHistory}
        sales={productHistorySales}
        purchases={productHistoryPurchases}
        loading={historyLoading}
      />
      <PaymentQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        amount={paidAmount || 0}
        upiId={userProfile?.upiId}
        payeeName={userProfile?.businessName || userProfile?.fullName || 'Merchant'}
      />
    </div>
  );
};

const NewTransaction = ({ type = 'sale' }) => {
  return (
    <NewTransactionProvider type={type}>
      <NewTransactionContent />
    </NewTransactionProvider>
  );
};

export default NewTransaction;
