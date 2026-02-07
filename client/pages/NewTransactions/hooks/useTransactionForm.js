import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatDateForInput } from '../utils/formatters';

/**
 * Hook for transaction form state management
 */
export const useTransactionForm = (type) => {
    const { state } = useLocation();
    const isSale = type === 'sale';
    const isPurchase = type === 'purchase';

    // Edit mode
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form fields
    const [date, setDate] = useState(() => formatDateForInput());
    const [products, setProducts] = useState([
        { id: Date.now(), name: '', qty: 1, price: '', amount: 0, isFree: false, manual: false }
    ]);
    const [paidAmount, setPaidAmount] = useState('');

    // Show notification helper using react-toastify
    const showNotify = (type, message) => {
        if (type === 'error') {
            toast.error(message);
        } else if (type === 'success') {
            toast.success(message);
        } else {
            toast.info(message);
        }
    };

    return {
        // Edit mode
        editMode,
        setEditMode,
        editingId,
        setEditingId,

        // Transaction type
        type,
        isSale,
        isPurchase,

        // Form fields
        date,
        setDate,
        products,
        setProducts,
        paidAmount,
        setPaidAmount,

        // Notifications
        showNotify,
    };
};
