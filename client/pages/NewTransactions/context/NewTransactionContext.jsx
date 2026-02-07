import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';
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

/**
 * Context for NewTransaction page
 * Lightweight provider using custom hooks
 */
const NewTransactionContext = createContext(null);

export const NewTransactionProvider = ({ type = 'sale', children }) => {
    const navigate = useNavigate();
    const { state } = useLocation();

    // Core hooks
    const formData = useTransactionForm(type);
    const productsData = useProducts();
    const customersData = useCustomers();
    const historyData = useProductHistory(formData.showNotify);

    // Theme based on transaction type
    const theme = getTheme(formData.isSale);

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

    // ===== Edit Mode Initialization =====
    useEffect(() => {
        if (state && state.mode === 'edit' && state.transaction) {
            const t = state.transaction;
            formData.setEditMode(true);
            formData.setEditingId(t.id);
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
        }
    }, [state]);

    // ===== Save Handler =====

    const handleSave = useCallback(async () => {
        const validation = validateTransaction(customersData.selectedCustomer, formData.products);

        if (!validation.valid) {
            formData.showNotify('error', validation.error);
            return;
        }

        try {
            const payload = buildTransactionPayload({
                selectedCustomer: customersData.selectedCustomer,
                date: formData.date,
                isSale: formData.isSale,
                filledProducts: validation.filledProducts,
                totals: calculationData.totals,
                paidAmount: formData.paidAmount,
                appliedOffers: calculationData.appliedOffers,
            });

            if (formData.editMode) {
                await api.put(`/trading/transactions/${formData.editingId}`, payload);
                formData.showNotify('success', 'Transaction Updated!');
            } else {
                await api.post('/trading/transactions', payload);
                formData.showNotify('success', 'Transaction Saved!');
            }

            setTimeout(() => navigate('/transactions'), 1000);
        } catch (err) {
            console.error(err);
            formData.showNotify('error', err.response?.data?.error || 'Failed to save');
        }
    }, [formData, customersData, calculationData, navigate]);

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
        handleSave,
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
