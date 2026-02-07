import { useState, useCallback } from 'react';
import api from '../../../src/api';

/**
 * Custom hook for deleting transactions with optimistic updates
 */
export const useDeleteTransaction = (onSuccess) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const deleteTransaction = useCallback(async (transaction, onLocalUpdate) => {
        // Confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete transaction #${transaction.id}? This will revert stock and party balance.`
        );

        if (!confirmed) return false;

        setIsDeleting(true);
        setDeletingId(transaction.id);

        // Optimistic update - remove from UI immediately
        if (onLocalUpdate) {
            onLocalUpdate(transaction.id);
        }

        try {
            // API call to delete
            await api.delete(`/trading/transactions/${transaction.id}`);

            // Success callback (if provided)
            if (onSuccess) {
                onSuccess(transaction);
            }

            return true;
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Failed to delete transaction. Please try again.');

            // Rollback optimistic update on error
            // The parent component should handle re-fetching or restoring the transaction
            return false;
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    }, [onSuccess]);

    return {
        deleteTransaction,
        isDeleting,
        deletingId
    };
};
