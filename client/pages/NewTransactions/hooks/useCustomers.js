import { useState, useEffect } from 'react';
import api from '../../../src/api';

/**
 * Hook for customer search and selection
 */
export const useCustomers = () => {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [custSearch, setCustSearch] = useState('');
    const [customerList, setCustomerList] = useState([]);
    const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [walkInDetails, setWalkInDetails] = useState(null);

    // Debounced customer search
    useEffect(() => {
        const timer = setTimeout(async () => {


            try {
                const { data } = await api.get(`/parties?search=${custSearch}`);
                setCustomerList(data);
            } catch (err) {
                console.error('Error fetching customers:', err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [custSearch]);

    return {
        selectedCustomer,
        setSelectedCustomer,
        custSearch,
        setCustSearch,
        customerList,
        isCustDropdownOpen,
        setIsCustDropdownOpen,
        showWalkInModal,
        setShowWalkInModal,
        walkInDetails,
        setWalkInDetails,
    };
};
