import React, { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../src/api';
import { useSettlementForm } from '../hooks/useSettlementForm';
import { useSettlementParties } from '../hooks/useSettlementParties';
import { useClickOutside } from '../../NewTransactions/hooks/useClickOutside';

const NewSettlementContext = createContext(null);

export const NewSettlementProvider = ({ type = 'receipt', children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isReceipt = type === 'receipt';

    // Core hooks
    const formData = useSettlementForm(type);
    const partiesData = useSettlementParties(isReceipt);

    // Edit Mode State
    const [editingId, setEditingId] = useState(null);

    // Notification state
    const [notification, setNotification] = React.useState(null);

    const showNotify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Refs
    const partyInputRef = useRef(null);

    // Click outside handler
    useClickOutside(
        [partyInputRef],
        () => partiesData.setIsDropdownOpen(false)
    );

    // Initialize Edit Mode
    useEffect(() => {
        if (location.state?.mode === 'edit' && location.state?.transaction) {
            const trx = location.state.transaction;
            setEditingId(trx.id);

            // Populate Form
            formData.setDate(trx.date);
            formData.setAmount(trx.amount);
            formData.setPaymentMode(trx.paymentMode);
            formData.setReferenceNumber(trx.referenceNumber || '');
            formData.setNotes(trx.notes || '');

            // Populate Party
            if (trx.partyId || trx.party) { // Assuming partyId is available or can be derived
                // If we have partyId, fetch full details to get balance
                const fetchPartyDetails = async () => {
                    try {
                        // If trx has party names/details but not full object, we might need to fetch
                        // Assuming trx.partyId exists or we use the name to find it?
                        // Usually API returns party as an object or just name. 
                        // Let's try to set what we have.

                        // FIX: If we only have name, we might not get ID. 
                        // But Transactions usually have partyId.
                        const pId = trx.partyId;
                        if (pId) {
                            const { data } = await api.get(`/parties/${pId}`);
                            partiesData.setSelectedParty(data);
                        } else {
                            // Fallback if no ID (shouldn't happen with proper backend)
                            partiesData.setSelectedParty({ name: trx.party, id: null });
                        }
                    } catch (e) {
                        console.error("Error fetching party for edit", e);
                    }
                };
                fetchPartyDetails();
            }
        }
    }, [location.state]);


    // Save Handler
    const handleSave = useCallback(async () => {
        if (!partiesData.selectedParty) {
            showNotify('error', 'Please select a party');
            return;
        }

        const amountNum = parseFloat(formData.amount);
        if (!amountNum || amountNum <= 0) {
            showNotify('error', 'Please enter a valid amount');
            return;
        }

        formData.setLoading(true);

        try {
            const payload = {
                partyId: partiesData.selectedParty.id,
                partyName: partiesData.selectedParty.name,
                date: formData.date,
                type: formData.transactionType,
                subTotal: amountNum,
                discount: 0,
                totalAmount: amountNum,
                paidAmount: amountNum,
                paymentMode: formData.paymentMode,
                referenceNumber: formData.referenceNumber || null,
                notes: formData.notes || null,
                products: [],
                appliedOffers: []
            };

            if (editingId) {
                await api.put(`/trading/transactions/${editingId}`, payload);
                showNotify('success', 'Transaction updated successfully!');
            } else {
                await api.post('/trading/transactions', payload);
                showNotify('success', `${isReceipt ? 'Receipt' : 'Payment'} recorded successfully!`);
            }

            setTimeout(() => {
                navigate('/transactions');
            }, 1000);

        } catch (err) {
            console.error('Settlement error:', err);
            showNotify('error', `Failed to ${editingId ? 'update' : 'record'} settlement.`);
        } finally {
            formData.setLoading(false);
        }
    }, [formData, partiesData, navigate, isReceipt, editingId]);

    const value = {
        ...formData,
        ...partiesData,
        partyInputRef,
        notification,
        showNotify,
        handleSave,
        isEditing: !!editingId
    };

    return (
        <NewSettlementContext.Provider value={value}>
            {children}
        </NewSettlementContext.Provider>
    );
};

export const useNewSettlementContext = () => {
    const context = useContext(NewSettlementContext);
    if (!context) {
        throw new Error('useNewSettlementContext must be used within NewSettlementProvider');
    }
    return context;
};
