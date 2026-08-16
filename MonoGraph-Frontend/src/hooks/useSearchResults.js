import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { normalizeItem, normalizeShop } from '../helpers/marketplace';

export function useSearchResults({ search = '', category = '', sort = '' } = {}) {
    const [items, setItems] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append('search', search.trim());
            }

            if (category) {
                params.append('category', category);
            }

            if (sort) {
                params.append('sort', sort);
            }

            const response = await api.baseURL.get(`/search?${params.toString()}`);
            const data = response?.data?.data;

            setItems((data?.items || []).map(normalizeItem));
            setShops((data?.shops || []).map(normalizeShop));
        } catch (error) {
            setItems([]);
            setShops([]);
        } finally {
            setLoading(false);
        }
    }, [category, search, sort]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    return { items, shops, loading, fetchResults };
}
