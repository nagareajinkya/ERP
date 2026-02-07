import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../src/api';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionTotals } from '../hooks/useTransactionTotals';
import { useDeleteTransaction } from '../hooks/useDeleteTransaction';
import { exportTransactionsCSV } from '../utils/exportCSV';
import { exportTransactionsPDF } from '../utils/exportPDF';

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

    // Delete transaction handler
    const { deleteTransaction, isDeleting, deletingId } = useDeleteTransaction(() => {
        // Refresh transactions after successful delete
        transactionsData.refreshTransactions();
    });

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
            alert('Failed to export PDF. Please try again.');
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
        const path = transaction.type.toUpperCase() === 'SALE' ? '/new-sale' : '/new-purchase';
        navigate(path, { state: { mode: 'edit', transaction } });
    }, [navigate]);

    // Delete transaction handler
    const handleDelete = useCallback(async (transaction) => {
        const success = await deleteTransaction(transaction, (deletedId) => {
            // Optimistic update: remove from local state immediately
            // This will be rolled back if API call fails
        });

        // If successful, refresh is already handled by useDeleteTransaction's onSuccess callback
    }, [deleteTransaction]);

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
        handleDelete,
        handleCloseModal,

        // Delete state
        isDeleting,
        deletingId
    };

    return (
        <TransactionsContext.Provider value={value}>
            {children}
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
