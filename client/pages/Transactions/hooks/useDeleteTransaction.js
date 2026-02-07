import { useState, useCallback } from 'react';
import api from '../../../src/api';
import { toast } from 'react-toastify';

/**
 * Custom hook for deleting transactions with optimistic updates
 */
export const useDeleteTransaction = (onSuccess) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const deleteTransaction = useCallback(async (transaction, onLocalUpdate) => {
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
            toast.error('Failed to delete transaction. Please try again.');

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
