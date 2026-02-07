import { useState, useEffect } from 'react';
import api from '../../../src/api';

/**
 * Hook for managing product master data and search
 */
export const useProducts = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [searchProducts, setSearchProducts] = useState([]);
    const [focusedRowId, setFocusedRowId] = useState(null);

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
            return;
        }
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchProducts(filtered);
    };

    return {
        allProducts,
        searchProducts,
        focusedRowId,
        setFocusedRowId,
        filterProducts,
        resetSearch: () => setSearchProducts(allProducts),
    };
};
