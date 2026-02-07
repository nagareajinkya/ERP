import { useState, useEffect } from 'react';
import api from '../../../src/api';

export const useSettlementParties = (isReceipt) => {
    const [selectedParty, setSelectedParty] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [partyList, setPartyList] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            // If search query is empty, we might want to show recent or all valid parties
            // But usually search starts when typing. 
            // However, for settlement, showing a list of people who owe money is good.

            try {
                setLoading(true);
                const { data } = await api.get('/parties');

                // No filtering by type - user wants to see both
                // const targetType = isReceipt ? 0 : 1; // 0=Customer, 1=Supplier

                let filtered = data || [];

                // If there is a search query, filter by name/phone
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    filtered = filtered.filter(p =>
                        p.name.toLowerCase().includes(q) ||
                        p.phoneNumber?.includes(q)
                    );
                } else {
                    // If no search, maybe prioritize those with balance?
                    // For now, let's just show those with non-zero balance first
                    filtered = filtered.sort((a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance));
                }

                setPartyList(filtered);
            } catch (err) {
                console.error('Error fetching parties:', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isReceipt]);

    return {
        selectedParty,
        setSelectedParty,
        searchQuery,
        setSearchQuery,
        partyList,
        isDropdownOpen,
        setIsDropdownOpen,
        partiesLoading: loading
    };
};
