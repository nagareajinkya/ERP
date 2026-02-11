import { useState, useEffect } from 'react';
import api from '../../../src/api';

/**
 * Hook for managing product master data and search
 */
export const useProducts = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [searchProducts, setSearchProducts] = useState([]);
    const [focusedRowId, setFocusedRowId] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/trading/products');
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
                setAllProducts(sorted);
                setSearchProducts(sorted);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };
        fetchProducts();
    }, []);

    // Filter products based on search query
    const filterProducts = (query) => {
        if (!query) {
            setSearchProducts(allProducts);
            setSelectedIndex(0);
            return;
        }
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchProducts(filtered);
        setSelectedIndex(0);
    };

    const moveSelection = (direction) => {
        setSelectedIndex(prev => {
            const next = prev + direction;
            if (next < 0) return 0;
            if (next >= searchProducts.length) return searchProducts.length - 1;
            return next;
        });
    };

    return {
        allProducts,
        searchProducts,
        focusedRowId,
        setFocusedRowId,
        filterProducts,
        resetSearch: () => {
            setSearchProducts(allProducts);
            setSelectedIndex(0);
        },
        selectedIndex,
        setSelectedIndex,
        moveSelection
    };
};
