import { useState, useCallback } from 'react';
import api from '../src/api';
import { toast } from 'react-toastify';

export const useParties = () => {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Financial Summary State
    const [financialSummary, setFinancialSummary] = useState({
        totalToReceive: 0,
        totalToPay: 0,
        netBalance: 0
    });

    const calculateFinancialSummary = useCallback((data) => {
        let toReceive = 0;
        let toPay = 0;

        data.forEach(p => {
            const bal = p.currentBalance || 0;
            if (bal > 0) toReceive += bal;
            else toPay += Math.abs(bal);
        });

        setFinancialSummary({
            totalToReceive: toReceive,
            totalToPay: toPay,
            netBalance: toReceive - toPay
        });
    }, []);

    const fetchParties = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/parties');
            const partyList = data || [];
            setParties(partyList);
            calculateFinancialSummary(partyList);
        } catch (err) {
            console.error('Error fetching parties:', err);
            setError(err);
            toast.error('Failed to load parties.');
        } finally {
            setLoading(false);
        }
    }, [calculateFinancialSummary]);

    const addParty = async (partyData) => {
        try {
            const res = await api.post('/parties', partyData);
            const newParty = res.data; // Assuming API returns created party
            // Optimistic update or fetch again
            fetchParties();
            toast.success('Party added successfully');
            return newParty;
        } catch (err) {
            console.error('Error adding party:', err);
            toast.error('Failed to add party');
            throw err;
        }
    };

    const updateParty = async (id, partyData) => {
        try {
            await api.put(`/parties/${id}`, partyData);
            fetchParties();
            toast.success('Party updated successfully');
        } catch (err) {
            console.error('Error updating party:', err);
            toast.error('Failed to update party');
            throw err;
        }
    };

    const deleteParty = async (id) => {
        try {
            await api.delete(`/parties/${id}`);
            fetchParties();
            toast.success('Party deleted successfully');
        } catch (err) {
            console.error('Error deleting party:', err);
            toast.error('Failed to delete party');
            throw err;
        }
    };

    return {
        parties,
        loading,
        error,
        financialSummary,
        fetchParties,
        addParty,
        updateParty,
        deleteParty
    };
};

export default useParties;
