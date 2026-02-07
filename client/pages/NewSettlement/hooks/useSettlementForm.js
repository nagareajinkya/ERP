import { useState, useCallback } from 'react';

export const useSettlementForm = (type) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Derived state
    const isReceipt = type === 'receipt';
    const transactionType = isReceipt ? 'RECEIPT' : 'PAYMENT';
    const theme = isReceipt ? {
        primary: 'bg-green-600',
        primaryHover: 'hover:bg-green-700',
        light: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        borderFocus: 'focus:border-green-500'
    } : {
        primary: 'bg-blue-600',
        primaryHover: 'hover:bg-blue-700',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        borderFocus: 'focus:border-blue-500'
    };

    const resetForm = useCallback(() => {
        setAmount('');
        setPaymentMode('CASH');
        setReferenceNumber('');
        setNotes('');
    }, []);

    return {
        date, setDate,
        amount, setAmount,
        paymentMode, setPaymentMode,
        referenceNumber, setReferenceNumber,
        notes, setNotes,
        loading, setLoading,
        isReceipt,
        transactionType,
        theme,
        resetForm
    };
};
