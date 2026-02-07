import { useState, useEffect } from 'react';
import api from '../../../src/api';

/**
 * Hook for auto-calculation and offers management
 */
export const useCalculationEngine = ({
    isSale,
    products,
    selectedCustomer,
    date,
    allProducts,
    setProducts,
}) => {
    const [totals, setTotals] = useState({ sub: 0, disc: 0, total: 0 });
    const [appliedOffers, setAppliedOffers] = useState([]);
    const [availableOffers, setAvailableOffers] = useState([]);
    const [removedOfferIds, setRemovedOfferIds] = useState([]);

    // Auto-calculate transaction
    useEffect(() => {
        // For purchases, simple calculation (no offers)
        if (!isSale) {
            const sub = products.reduce((acc, i) =>
                acc + (Number(i.price || 0) * Number(i.qty || 0)), 0
            );
            setTotals({ sub, disc: 0, total: sub });
            return;
        }

        // Skip calculation if user is still typing a product name
        const hasIncompleteName = products.some(p =>
            p.name && !p.productId && p.name.trim() !== '' && !p.isFree
        );
        if (hasIncompleteName) return;

        // Call backend calculation engine
        const calculateTransaction = async () => {
            try {
                const payload = {
                    products: products.map(p => ({
                        id: p.id,
                        name: p.name,
                        qty: p.qty,
                        price: p.price,
                        productId: p.productId,
                        isFree: p.isFree,
                    })),
                    customerId: selectedCustomer?.id === 'walk-in' ? null : selectedCustomer?.id,
                    date,
                    excludedOffers: removedOfferIds,
                };

                const { data } = await api.post('/smart-ops/calculate', payload);

                setTotals(data.totals);
                setAppliedOffers(data.appliedOffers);
                setAvailableOffers(data.availableOffers);

                // Ensure auto-added free items have productId
                const normalizedProducts = (data.products || []).map(p => {
                    if (p?.isFree && !p.productId && p.name) {
                        const match = allProducts.find(ap =>
                            ap.name?.trim().toLowerCase() === p.name.trim().toLowerCase()
                        );
                        if (match) return { ...p, productId: match.id };
                    }
                    return p;
                });

                setProducts(normalizedProducts);
            } catch (err) {
                console.error('Calculation error:', err);
            }
        };

        const timer = setTimeout(calculateTransaction, 300);
        return () => clearTimeout(timer);
    }, [
        products.map(p => `${p.productId}-${p.qty}-${p.price}`).join(','),
        selectedCustomer?.id,
        date,
        isSale,
        removedOfferIds,
        allProducts,
        setProducts,
    ]);

    const handleRemoveOffer = (offerId) => {
        setRemovedOfferIds(prev => [...prev, offerId]);
    };

    const handleReapplyOffer = (offerId) => {
        setRemovedOfferIds(prev => prev.filter(id => id !== offerId));
    };

    return {
        totals,
        appliedOffers,
        availableOffers,
        removedOfferIds,
        handleRemoveOffer,
        handleReapplyOffer,
    };
};
