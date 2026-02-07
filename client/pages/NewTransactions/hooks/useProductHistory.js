import { useState } from 'react';
import api from '../../../src/api';

/**
 * Hook for product history modal
 */
export const useProductHistory = (showNotify) => {
    const [showProductHistory, setShowProductHistory] = useState(false);
    const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);
    const [productHistorySales, setProductHistorySales] = useState([]);
    const [productHistoryPurchases, setProductHistoryPurchases] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const handleViewProductHistory = async (product) => {
        if (!product || !product.id) {
            showNotify?.('error', 'Cannot load history for this product');
            return;
        }

        try {
            setHistoryLoading(true);
            const { data } = await api.get(`/trading/products/${product.id}/transactions`);
            setSelectedProductForHistory(product);
            setProductHistorySales(data.sales || []);
            setProductHistoryPurchases(data.purchases || []);
            setShowProductHistory(true);
        } catch (err) {
            console.error('Error fetching product history:', err);
            showNotify?.('error', 'Failed to load product history. Please try again.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeProductHistory = () => {
        setShowProductHistory(false);
        setSelectedProductForHistory(null);
        setProductHistorySales([]);
        setProductHistoryPurchases([]);
    };

    return {
        showProductHistory,
        selectedProductForHistory,
        productHistorySales,
        productHistoryPurchases,
        historyLoading,
        handleViewProductHistory,
        closeProductHistory,
    };
};
