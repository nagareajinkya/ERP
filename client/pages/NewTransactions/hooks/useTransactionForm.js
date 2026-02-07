import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { formatDateForInput } from '../utils/formatters';

/**
 * Hook for transaction form state management
 */
export const useTransactionForm = (type) => {
    const { state } = useLocation();
    const isSale = type === 'sale';

    // Edit mode
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form fields
    const [date, setDate] = useState(() => formatDateForInput());
    const [products, setProducts] = useState([
        { id: Date.now(), name: '', qty: 1, price: '', amount: 0, isFree: false, manual: false }
    ]);
    const [paidAmount, setPaidAmount] = useState('');

    // Notification
    const [notification, setNotification] = useState({ type: '', message: '' });

    // Show notification helper
    const showNotify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    };

    return {
        // Edit mode
        editMode,
        setEditMode,
        editingId,
        setEditingId,

        // Transaction type
        isSale,

        // Form fields
        date,
        setDate,
        products,
        setProducts,
        paidAmount,
        setPaidAmount,

        // Notifications
        notification,
        showNotify,
    };
};
