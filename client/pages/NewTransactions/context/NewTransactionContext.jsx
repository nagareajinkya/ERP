import React, { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../src/api';
import { getTheme } from '../config/theme';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { useProductHistory } from '../hooks/useProductHistory';
import { useCalculationEngine } from '../hooks/useCalculationEngine';
import { useClickOutside } from '../hooks/useClickOutside';
import { validateTransaction } from '../utils/validators';
import { buildTransactionPayload } from '../utils/payloadMapper';
import { useUI } from '../../../context/UIContext';
import { useAuth } from '../../../context/AuthContext';

/**
 * Context for NewTransaction page
 * Lightweight provider using custom hooks
 */
const NewTransactionContext = createContext(null);

export const NewTransactionProvider = ({ type = 'sale', children }) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { refreshStats } = useUI();
    const { user, checkAuth } = useAuth();

    // Fetch latest user data on mount to ensure UPI ID is up to date
    useEffect(() => {
        checkAuth();
    }, []);

    // QR Modal State
    const [showQRModal, setShowQRModal] = useState(false);

    // Core hooks
    const formData = useTransactionForm(type);
    const productsData = useProducts();
    const customersData = useCustomers();
    const historyData = useProductHistory(formData.showNotify);

    // Theme based on transaction type
    const theme = getTheme(formData.type);

    // Calculation engine (depends on form and product data)
    const calculationData = useCalculationEngine({
        isSale: formData.isSale,
        products: formData.products,
        selectedCustomer: customersData.selectedCustomer,
        date: formData.date,
        allProducts: productsData.allProducts,
        setProducts: formData.setProducts,
    });

    // Refs for click outside detection
    const custInputRef = useRef(null);

    // Click outside handler
    useClickOutside(
        [custInputRef],
        () => customersData.setIsCustDropdownOpen(false)
    );

    // ===== Product Handlers =====

    const handleAddProduct = useCallback(() => {
        const lastProduct = formData.products[formData.products.length - 1];
        if (lastProduct && lastProduct.name === '' && !lastProduct.isFree) {
            productsData.setFocusedRowId(lastProduct.id);
            return;
        }

        const newId = Date.now();
        formData.setProducts(prev => [...prev, {
            id: newId,
            name: '',
            qty: 1,
            price: '',
            amount: 0,
            isFree: false,
            manual: false
        }]);

        setTimeout(() => productsData.setFocusedRowId(newId), 50);
    }, [formData, productsData]);

    const handleRemoveProduct = useCallback((id, isOfferRemoval = false) => {
        if (isOfferRemoval) {
            const product = formData.products.find(i => i.id === id);
            if (product?.offerId) {
                calculationData.handleRemoveOffer(product.offerId);
            }
            formData.setProducts(prev => prev.filter(i => i.id !== id));
        } else {
            if (formData.products.length === 1) {
                formData.setProducts([{
                    id: Date.now(),
                    name: '',
                    qty: 1,
                    price: '',
                    amount: 0,
                    isFree: false
                }]);
            } else {
                formData.setProducts(prev => prev.filter(i => i.id !== id));
            }
        }
    }, [formData, calculationData]);

    const handleUpdateProduct = useCallback((id, field, value) => {
        formData.setProducts(prev => prev.map(p => {
            if (p.id === id) {
                if (field === 'qty' && value < 1) return p;
                if (field === 'price' && value < 0) return p;

                const updated = { ...p, [field]: value };
                if (p.isFree) updated.manual = true;
                updated.amount = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
                return updated;
            }
            return p;
        }));

        if (field === 'name') {
            formData.setProducts(prev => prev.map(p =>
                p.id === id ? { ...p, productId: null, name: value } : p
            ));
            productsData.setFocusedRowId(id);
            productsData.filterProducts(value);
        }
    }, [formData, productsData]);

    const handleProductSelect = useCallback(async (rowId, product) => {
        if (!rowId) return;

        try {
            const { data } = await api.get(`/trading/products/${product.id}/transactions`);
            const recommendedPrice = data?.recommendedPrice ?? product.price;

            formData.setProducts(prev => prev.map(item => {
                if (item.id === rowId) {
                    return {
                        ...item,
                        productId: product.id,
                        name: product.name,
                        price: recommendedPrice,
                        amount: (Number(item.qty) || 1) * (Number(recommendedPrice) || 0),
                    };
                }
                return item;
            }));
        } catch (err) {
            // Fallback to product price
            formData.setProducts(prev => prev.map(item =>
                item.id === rowId
                    ? {
                        ...item,
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        amount: (Number(item.qty) || 1) * (Number(product.price) || 0)
                    }
                    : item
            ));
        } finally {
            productsData.setFocusedRowId(null);
            productsData.resetSearch();
        }
    }, [formData, productsData]);

    const handleKeyDown = useCallback((e, rowId) => {
        if (!productsData.searchProducts.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            productsData.moveSelection(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            productsData.moveSelection(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const product = productsData.searchProducts[productsData.selectedIndex];
            if (product) {
                handleProductSelect(rowId, product);
            }
        }
    }, [productsData, handleProductSelect]);

    // ===== Edit Mode Initialization =====
    useEffect(() => {
        if (state && state.mode === 'edit' && state.transaction) {
            const t = state.transaction;
            formData.setEditMode(true);
            formData.setEditingId(t._id || t.id);
            formData.setDate(t.date);

            // Set Customer
            if (t.partyId) {
                customersData.setSelectedCustomer({ id: t.partyId, name: t.party });
            } else {
                customersData.setSelectedCustomer({ id: 'walk-in', name: t.party });
            }

            // Map Products
            const mappedProducts = t.details.map((d, i) => ({
                id: Date.now() + i,
                name: d.name,
                qty: parseFloat(d.qty),
                price: parseFloat(d.rate),
                amount: parseFloat(d.total),
                productId: d.productId,
                isFree: d.isFree || d.free || (Number(d.rate) === 0.01 && Number(d.total) === 0),
                manual: false,
            }));
            formData.setProducts(mappedProducts);
            formData.setPaidAmount(t.paidAmount);
            formData.setPaymentMode(t.paymentMode || 'CASH');
            formData.setNotes(t.notes || '');
        }
    }, [state]);

    // If navigated here with a preselected party (from Party detail view), set it
    useEffect(() => {
        if (state && state.partyId && !(state.mode === 'edit')) {
            customersData.setSelectedCustomer({ id: state.partyId, name: state.partyName || state.party });
        }
    }, [state]);

    // ===== Auto-QR Popup Logic =====
    useEffect(() => {
        if (!user?.alwaysShowPaymentQr || !formData.isSale) return;
        if (formData.paymentMode !== 'UPI') return;

        const paid = Number(formData.paidAmount) || 0;
        if (paid <= 0) return;

        // Start 1.5s timer
        const timer = setTimeout(() => {
            // Re-verify conditions after delay
            if (formData.paymentMode === 'UPI' && (Number(formData.paidAmount) || 0) > 0 && user?.upiId) {
                setShowQRModal(true);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [formData.paidAmount, formData.paymentMode, user?.alwaysShowPaymentQr, user?.upiId]);

    // ===== Save Handler =====

    const handleSave = useCallback(async () => {
        if (formData.loading) return;

        const validation = validateTransaction(customersData.selectedCustomer, formData.products);

        if (!validation.valid) {
            formData.showNotify('error', validation.error);
            return;
        }

        formData.setLoading(true);

        try {
            const payload = buildTransactionPayload({
                selectedCustomer: customersData.selectedCustomer,
                date: formData.date,
                isSale: formData.isSale,
                filledProducts: validation.filledProducts,
                totals: calculationData.totals,
                paidAmount: formData.paidAmount,
                paymentMode: formData.paymentMode,
                notes: formData.notes,
                appliedOffers: calculationData.appliedOffers,
            });

            let savedTransaction;
            if (formData.editMode) {
                const response = await api.put(`/trading/transactions/${formData.editingId}`, payload);
                savedTransaction = response.data.data;
                formData.showNotify('success', 'Transaction Updated!');
            } else {
                const response = await api.post('/trading/transactions', payload);
                savedTransaction = response.data.data;
                formData.showNotify('success', 'Transaction Saved!');
            }

            refreshStats(); // Update Sidebar Stats

            // Navigate based on transaction type
            setTimeout(() => {
                if (formData.isSale) {
                    navigate('/bill-preview', {
                        state: { transaction: savedTransaction }
                    });
                } else {
                    // For purchase, stay on new-purchase page but reload (or clear form)
                    // We can just navigate back to the same route to reset the context state
                    navigate('/new-purchase', { replace: true, state: null });
                    window.location.reload();
                }
            }, 1000);
        } catch (err) {
            console.error(err);
            formData.showNotify('error', err.response?.data?.error || 'Failed to save');
        } finally {
            formData.setLoading(false);
        }
    }, [formData, customersData, calculationData, navigate]);

    // ===== QR Code Handler =====
    const handleShowQR = useCallback(() => {
        if (formData.paymentMode !== 'UPI') {
            formData.showNotify('info', 'Please select UPI payment mode first');
            return;
        }
        if (calculationData.totals.total <= 0) {
            formData.showNotify('error', 'Total amount must be greater than 0');
            return;
        }
        if (!formData.paidAmount || Number(formData.paidAmount) <= 0) {
            formData.showNotify('error', 'Please enter a Paid Amount greater than 0');
            return;
        }
        if (!user?.upiId) {
            console.error("User object missing UPI ID:", user);
            formData.showNotify('error', `Please configure your UPI ID in Profile settings first. Found: ${user?.upiId || 'None'}`);
            return;
        }
        setShowQRModal(true);
    }, [formData, calculationData, user]);

    // ===== Context Value =====

    const value = {
        // Form data
        ...formData,

        // Products data
        ...productsData,

        // Customers data
        ...customersData,
        custInputRef, // For click outside

        // History data
        ...historyData,

        // Calculation data
        ...calculationData,

        // Theme
        theme,

        // Handlers
        handleAddProduct,
        handleRemoveProduct,
        handleUpdateProduct,
        handleProductSelect,
        handleKeyDown,
        handleSave,

        // QR Modal
        showQRModal,
        setShowQRModal,
        handleShowQR,
        userProfile: user
    };

    return (
        <NewTransactionContext.Provider value={value}>
            {children}
        </NewTransactionContext.Provider>
    );
};

/**
 * Hook to use NewTransaction context
 */
export const useNewTransactionContext = () => {
    const context = useContext(NewTransactionContext);

    if (!context) {
        throw new Error('useNewTransactionContext must be used within NewTransactionProvider');
    }

    return context;
};
