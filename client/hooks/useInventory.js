import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/api';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing inventory data with React Query
 */
export const useInventory = () => {
    const queryClient = useQueryClient();

    // 1. Fetch Categories
    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/trading/categories');
            return data || [];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    // 2. Fetch Units
    const unitsQuery = useQuery({
        queryKey: ['units'],
        queryFn: async () => {
            const { data } = await api.get('/trading/units');
            return data || [];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    // 3. Fetch Products
    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await api.get('/trading/products');
            // Map Backend DTO to Frontend Structure
            return (data || []).map(p => ({
                ...p,
                category: p.categoryName || '',
                unit: p.unitName || '',
                qty: p.currentStock || 0
            }));
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Fetch Products with client-side filtering (internal to context usually, 
    // but here we provide a way to get filtered products)
    const getFilteredProducts = (filters = {}) => {
        const { searchQuery = '', selectedCategory = 'All' } = filters;
        const allProducts = productsQuery.data || [];

        let filtered = allProducts;
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
        return filtered;
    };

    // Mutations
    const addProductMutation = useMutation({
        mutationFn: async (productData) => {
            await api.post('/trading/products', productData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product added successfully');
        },
        onError: () => toast.error('Failed to add product')
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, productData }) => {
            await api.put(`/trading/products/${id}`, productData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product updated successfully');
        },
        onError: () => toast.error('Failed to update product')
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/trading/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
        },
        onError: () => toast.error('Failed to delete product')
    });

    const importProductsMutation = useMutation({
        mutationFn: async (products) => {
            const response = await api.post('/trading/products/bulk', { products });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => toast.error('Failed to import products')
    });

    return {
        products: productsQuery.data || [],
        categoriesList: categoriesQuery.data || [],
        unitsList: unitsQuery.data || [],
        loading: productsQuery.isLoading || categoriesQuery.isLoading || unitsQuery.isLoading,
        error: productsQuery.error || categoriesQuery.error || unitsQuery.error,
        getFilteredProducts,
        fetchProducts: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
        fetchMetadata: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['units'] });
        },
        addProduct: addProductMutation.mutateAsync,
        updateProduct: (id, productData) => updateProductMutation.mutateAsync({ id, productData }),
        deleteProduct: deleteProductMutation.mutateAsync,
        importProducts: importProductsMutation.mutateAsync
    };
};

export default useInventory;
