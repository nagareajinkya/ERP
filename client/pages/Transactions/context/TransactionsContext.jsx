import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../src/api';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionTotals } from '../hooks/useTransactionTotals';
import { useDeleteTransaction } from '../hooks/useDeleteTransaction';
import { exportTransactionsCSV } from '../utils/exportCSV';
import { exportTransactionsPDF } from '../utils/exportPDF';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

/**
 * Context for Transactions page
 * Provides all state and handlers to child components
 */
const TransactionsContext = createContext(null);

export const TransactionsProvider = ({ children }) => {
    const navigate = useNavigate();

    // Use custom hooks for data and state management
    const transactionsData = useTransactions();
    const totals = useTransactionTotals(transactionsData.transactions);

    // Modal state
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    // Delete transaction handler
    const { deleteTransaction, isDeleting, deletingId } = useDeleteTransaction();

    // Export handlers
    const handleExportCSV = useCallback(() => {
        exportTransactionsCSV(
            transactionsData.transactions,
            transactionsData.filterType,
            transactionsData.dateFilter
        );
    }, [transactionsData.transactions, transactionsData.filterType, transactionsData.dateFilter]);

    const handleExportPDF = useCallback(async () => {
        try {
            // Fetch business details from API
            const { data: businessData } = await api.get('/auth/profile');
            const business = businessData?.business || businessData || {};

            await exportTransactionsPDF(
                transactionsData.transactions,
                business,
                transactionsData.filterType,
                transactionsData.dateFilter,
                transactionsData.customDateRange,
                totals.totalCredit,
                totals.totalDebit
            );
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF. Please try again.');
        }
    }, [
        transactionsData.transactions,
        transactionsData.filterType,
        transactionsData.dateFilter,
        transactionsData.customDateRange,
        totals.totalCredit,
        totals.totalDebit
    ]);

    // View transaction handler
    const handleView = useCallback((transaction) => {
        setSelectedTransaction(transaction);
    }, []);

    // Edit transaction handler
    const handleEdit = useCallback((transaction) => {
        const type = transaction.type.toUpperCase();
        let path = '/new-sale';

        if (type === 'PURCHASE') path = '/new-purchase';
        else if (type === 'RECEIPT') path = '/new-receipt';
        else if (type === 'PAYMENT') path = '/new-payment';

        navigate(path, { state: { mode: 'edit', transaction } });
    }, [navigate]);

    // Print transaction handler
    const handlePrint = useCallback((transaction) => {
        navigate('/bill-preview', { state: { transaction } });
    }, [navigate]);

    // Delete transaction handler - Opens Modal
    const handleDelete = useCallback((transaction) => {
        setTransactionToDelete(transaction);
        setDeleteModalOpen(true);
    }, []);

    // Actual Delete Execution
    const confirmDelete = useCallback(async () => {
        if (!transactionToDelete) return;

        const success = await deleteTransaction(transactionToDelete, (deletedId) => {
            // Optimistic update: remove from local state immediately
            // This will be rolled back if API call fails
            // Note: refreshing transactions via refreshTransactions is safer than optimistic update here if pagination is involved,
            // but for now, rely on onSuccess callback refetch.
        });

        setDeleteModalOpen(false);
        setTransactionToDelete(null);
    }, [deleteTransaction, transactionToDelete]);

    // Close modal handler
    const handleCloseModal = useCallback(() => {
        setSelectedTransaction(null);
    }, []);

    // Context value
    const value = {
        // Transaction data and filters
        ...transactionsData,

        // Totals
        ...totals,

        // Modal state
        selectedTransaction,
        setSelectedTransaction,

        // Handlers
        handleExportCSV,
        handleExportPDF,
        handleView,
        handleEdit,
        handlePrint,
        handleDelete,
        handleCloseModal,

        // Delete state
        isDeleting,
        deletingId
    };

    return (
        <TransactionsContext.Provider value={value}>
            {children}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setTransactionToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                type="delete"
                confirmText={isDeleting ? 'Deleting...' : 'Delete'}
            />
        </TransactionsContext.Provider>
    );
};

/**
 * Custom hook to use Transactions context
 * Throws error if used outside TransactionsProvider
 */
export const useTransactionsContext = () => {
    const context = useContext(TransactionsContext);

    if (!context) {
        throw new Error('useTransactionsContext must be used within TransactionsProvider');
    }

    return context;
};
