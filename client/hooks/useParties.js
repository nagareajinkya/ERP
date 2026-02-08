import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/api';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing parties data with React Query
 */
export const useParties = () => {
    const queryClient = useQueryClient();

    // Fetch parties using React Query
    const {
        data: parties = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['parties'],
        queryFn: async () => {
            const { data } = await api.get('/parties');
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Calculate Financial Summary (Memoized)
    const financialSummary = useMemo(() => {
        let toReceive = 0;
        let toPay = 0;

        parties.forEach(p => {
            const bal = p.currentBalance || 0;
            if (bal > 0) toReceive += bal;
            else toPay += Math.abs(bal);
        });

        return {
            totalToReceive: toReceive,
            totalToPay: toPay,
            netBalance: toReceive - toPay
        };
    }, [parties]);

    // Mutations
    const addMutation = useMutation({
        mutationFn: async (partyData) => {
            const res = await api.post('/parties', partyData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            toast.success('Party added successfully');
        },
        onError: () => toast.error('Failed to add party')
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, partyData }) => {
            await api.put(`/parties/${id}`, partyData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            toast.success('Party updated successfully');
        },
        onError: () => toast.error('Failed to update party')
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/parties/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            toast.success('Party deleted successfully');
        },
        onError: () => toast.error('Failed to delete party')
    });

    return {
        parties,
        loading,
        error,
        financialSummary,
        refreshParties: () => queryClient.invalidateQueries({ queryKey: ['parties'] }),
        addParty: addMutation.mutateAsync,
        updateParty: (id, partyData) => updateMutation.mutateAsync({ id, partyData }),
        deleteParty: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};

export default useParties;
