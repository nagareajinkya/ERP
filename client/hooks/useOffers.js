import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../src/api';
import { toast } from 'react-toastify';

export const useOffers = () => {
    // --- STATE ---
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState([]);
    const [allUnits, setAllUnits] = useState([]);
    const [redemptions, setRedemptions] = useState([]);

    // --- FETCH DATA ---
    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/smart-ops/offers');
            setOffers(res.data);
        } catch (err) {
            console.error("Failed to fetch offers", err);
            toast.error("Failed to fetch offers");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchResources = useCallback(async () => {
        try {
            const [prodRes, unitRes] = await Promise.all([
                api.get('/trading/products'),
                api.get('/trading/units')
            ]);
            setAllProducts(prodRes.data);
            setAllUnits(unitRes.data);
        } catch (err) {
            console.error("Failed to fetch resources", err);
        }
    }, []);

    const fetchRedemptions = useCallback(async (offerId) => {
        if (!offerId) {
            setRedemptions([]);
            return;
        }
        try {
            const res = await api.get(`/smart-ops/offers/${offerId}/redemptions`);
            setRedemptions(res.data);
        } catch (err) {
            console.error("Failed to load redemptions", err);
            setRedemptions([]);
        }
    }, []);

    // --- ACTIONS ---
    const createOffer = async (offerData) => {
        try {
            await api.post('/smart-ops/offers', offerData);
            await fetchOffers();
            toast.success("Offer created successfully");
            return true;
        } catch (err) {
            console.error("Error creating offer", err);
            toast.error("Failed to create offer");
            return false;
        }
    };

    const updateOffer = async (id, offerData) => {
        try {
            await api.put(`/smart-ops/offers/${id}`, offerData);
            await fetchOffers();
            toast.success("Offer updated successfully");
            return true;
        } catch (err) {
            console.error("Error updating offer", err);
            toast.error("Failed to update offer");
            return false;
        }
    };

    const togglePause = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'paused' : 'active';
            await api.patch(`/smart-ops/offers/${id}/status`, { status: newStatus });
            await fetchOffers();
            toast.success(`Offer ${newStatus === 'active' ? 'activated' : 'paused'}`);
        } catch (err) {
            console.error("Error toggling status", err);
            toast.error("Failed to toggle status");
        }
    };

    const deleteOffer = async (id) => {
        try {
            await api.delete(`/smart-ops/offers/${id}`);
            await fetchOffers();
            toast.success("Offer deleted successfully");
        } catch (err) {
            console.error("Error deleting offer", err);
            toast.error("Failed to delete offer");
        }
    };

    const stopOffer = async (id) => {
        try {
            await api.patch(`/smart-ops/offers/${id}/status`, { status: 'expired' });
            await fetchOffers();
            toast.success("Offer stopped successfully");
        } catch (err) {
            console.error("Error stopping offer", err);
            toast.error("Failed to stop offer");
        }
    };

    // --- HELPERS ---
    const searchParties = async (params) => {
        const { targetType, topSpenderCount, topSpenderDuration, topSpenderUnit, minVisits, frequentDuration, customerSearch } = params;
        let endpoint = '';
        if (targetType === 'top_spenders') {
            endpoint = `/trading/stats/top-spenders?limit=${topSpenderCount || 10}&duration=${topSpenderDuration || 1}&unit=${topSpenderUnit || 'Years'}`;
        } else if (targetType === 'frequent') {
            endpoint = `/trading/stats/frequent-visitors?limit=100&duration=${frequentDuration || 30}&minVisits=${minVisits || 5}`;
        } else if (targetType === 'specific') {
            endpoint = `/parties?search=${customerSearch}`;
        }

        if (endpoint) {
            try {
                const res = await api.get(endpoint);
                return res.data;
            } catch (err) {
                console.error(err);
                return [];
            }
        }
        return [];
    };

    useEffect(() => {
        fetchOffers();
        fetchResources();
    }, [fetchOffers, fetchResources]);

    return {
        offers,
        loading,
        allProducts,
        allUnits,
        redemptions,
        fetchRedemptions,
        createOffer,
        updateOffer,
        togglePause,
        deleteOffer,
        stopOffer,
        searchParties
    };
};

export default useOffers;
