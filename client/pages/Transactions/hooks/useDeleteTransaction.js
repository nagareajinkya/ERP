import { useState, useCallback } from 'react';
import api from '../../../src/api';
import { toast } from 'react-toastify';
import { useUI } from '../../../context/UIContext';

/**
 * Custom hook for deleting transactions with optimistic updates
 */
export const useDeleteTransaction = (onSuccess) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const { refreshStats } = useUI();

    const deleteTransaction = useCallback(async (transaction, onLocalUpdate) => {
        setIsDeleting(true);
        const idToDelete = transaction._id || transaction.id;
        setDeletingId(idToDelete);

        // Optimistic update - remove from UI immediately
        if (onLocalUpdate) {
            onLocalUpdate(transaction._id || transaction.id);
        }

        console.log('Deleting transaction with ID:', idToDelete);

        try {
            // API call to delete
            await api.delete(`/trading/transactions/${idToDelete}`);

            // Success callback (if provided)
            if (onSuccess) {
                onSuccess(transaction);
            }

            refreshStats(); // Update Sidebar Stats

            return true;
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete transaction';
            toast.error(errorMessage);

            // Rollback optimistic update on error
            // The parent component should handle re-fetching or restoring the transaction
            return false;
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    }, [onSuccess, refreshStats]);

    return {
        deleteTransaction,
        isDeleting,
        deletingId
    };
};
