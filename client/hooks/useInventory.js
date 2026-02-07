import { useState, useEffect, useCallback } from 'react';
import api from '../src/api';
import { toast } from 'react-toastify';

export const useInventory = () => {
    const [products, setProducts] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [unitsList, setUnitsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial fetch of metadata
    const fetchMetadata = useCallback(async () => {
        try {
            const [catRes, unitRes] = await Promise.all([
                api.get('/trading/categories'), // Gateway routes
                api.get('/trading/units')
            ]);
            setCategoriesList(catRes.data || []);
            setUnitsList(unitRes.data || []);
        } catch (err) {
            console.error('Error fetching metadata:', err);
            // toast.error('Failed to load categories/units');
        }
    }, []);

    const fetchProducts = useCallback(async (filters = {}) => {
        const { searchQuery = '', selectedCategory = 'All' } = filters;
        setLoading(true);
        setError(null);
        try {
            // Fetch all products first (Client-side filtering for now as per plan/backend limits)
            const { data } = await api.get('/trading/products');

            // Map Backend DTO to Frontend Structure
            const mappedProducts = (data || []).map(p => ({
                ...p,
                category: p.categoryName || '', // Map name for UI
                unit: p.unitName || '',         // Map name for UI
                qty: p.currentStock || 0
            }));

            // Client-side filtering
            let filtered = mappedProducts;
            if (selectedCategory !== 'All') {
                filtered = filtered.filter(p => p.category === selectedCategory);
            }
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(p =>
                    p.name?.toLowerCase().includes(q) ||
                    p.sku?.toLowerCase().includes(q) ||
                    p.hsn?.includes(q)
                );
            }

            setProducts(filtered);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err);
            setProducts([]);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    const addProduct = async (productData) => {
        try {
            await api.post('/trading/products', productData);
            toast.success('Product added successfully');
            return true;
        } catch (err) {
            console.error('Error adding product:', err);
            toast.error('Failed to add product');
            throw err;
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            await api.put(`/trading/products/${id}`, productData);
            toast.success('Product updated successfully');
            return true;
        } catch (err) {
            console.error('Error updating product:', err);
            toast.error('Failed to update product');
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        try {
            await api.delete(`/trading/products/${id}`);
            toast.success('Product deleted successfully');
            // Optimistic update could happen here, but we usually refetch in component
            return true;
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete product');
            throw err;
        }
    };

    // Initial Load
    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    return {
        products,
        categoriesList,
        unitsList,
        loading,
        error,
        fetchProducts,
        fetchMetadata,
        addProduct,
        updateProduct,
        deleteProduct
    };
};

export default useInventory;
