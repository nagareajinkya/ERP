import React from 'react';
import { CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Sliders, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

/**
 * Formatting utilities for transaction display
 */

// Get status badge component
export const getStatusBadge = (status) => {
    switch (status) {
        case 'Paid':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700">
                    <CheckCircle2 size={12} /> Paid
                </span>
            );
        case 'Unpaid':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                    <Clock size={12} /> Unpaid
                </span>
            );
        case 'Partial':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700">
                    <Clock size={12} /> Partial
                </span>
            );
        case 'Loss':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500">
                    Loss
                </span>
            );
        default:
            return null;
    }
};

// Get transaction type icon
export const getTypeIcon = (type) => {
    const typeUpper = type?.toUpperCase();

    if (typeUpper === 'SALE') {
        return (
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <ArrowUpRight size={18} />
            </div>
        );
    }

    if (typeUpper === 'PURCHASE') {
        return (
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <ArrowDownRight size={18} />
            </div>
        );
    }

    return (
        <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
            <Sliders size={18} />
        </div>
    );
};

// Format currency amount (₹1,23,456)
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Calculate due amount for a transaction
export const calculateDueAmount = (transaction) => {
    if (!transaction) return 0;

    const { status, amount, paidAmount = 0 } = transaction;

    if (status === 'Partial' || status === 'Unpaid') {
        return amount - paidAmount;
    }

    return 0;
};

// Get transaction type color class
export const getTypeColorClass = (type) => {
    const typeUpper = type?.toUpperCase();

    if (typeUpper === 'SALE') return 'text-green-600';
    if (typeUpper === 'PURCHASE') return 'text-red-600';
    return 'text-gray-600';
};

// Get amount display with sign
export const formatAmountWithSign = (amount, type) => {
    const typeUpper = type?.toUpperCase();
    let sign = '';
    if (['SALE'].includes(typeUpper)) sign = '+';
    if (['PURCHASE'].includes(typeUpper)) sign = '-';

    return `${sign} ${formatCurrency(amount)}`;
};
