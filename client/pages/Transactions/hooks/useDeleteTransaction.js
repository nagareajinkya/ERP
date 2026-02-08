import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../src/api';
import { toast } from 'react-toastify';
import { useUI } from '../../../context/UIContext';

/**
 * Custom hook for deleting transactions with React Query Mutations
 * Features optimistic updates for instantaneous UI response
 */
export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    const { refreshStats } = useUI();

    const mutation = useMutation({
        mutationFn: async (transaction) => {
            const idToDelete = transaction._id || transaction.id;
            await api.delete(`/trading/transactions/${idToDelete}`);
            return transaction;
        },
        // When mutate is called:
        onMutate: async (deletedTransaction) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['transactions'] });

            // Snapshot the previous value
            const previousTransactions = queryClient.getQueryData(['transactions']);

            // Optimistically update to the new value by filtering out the deleted item
            queryClient.setQueriesData({ queryKey: ['transactions'] }, (old) => {
                if (!old) return [];
                return old.filter(t => (t._id || t.id) !== (deletedTransaction._id || deletedTransaction.id));
            });

            // Return a context object with the snapshotted value
            return { previousTransactions };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, deletedTransaction, context) => {
            queryClient.setQueriesData({ queryKey: ['transactions'] }, context.previousTransactions);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete transaction';
            toast.error(errorMessage);
        },
        // Always refetch after error or success to ensure we are in sync with the server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            refreshStats(); // Update Sidebar Stats
        },
        onSuccess: () => {
            toast.success('Transaction deleted successfully');
        }
    });

    return {
        deleteTransaction: mutation.mutateAsync,
        isDeleting: mutation.isPending || mutation.isLoading, // Match previous API names
        deletingId: mutation.variables?.id || mutation.variables?._id
    };
};
