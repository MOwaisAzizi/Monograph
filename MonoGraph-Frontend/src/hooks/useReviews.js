import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const EMPTY_SUMMARY = { average: 0, total: 0, distribution: {} };

export function useReviews(targetType, targetId) {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(EMPTY_SUMMARY);

    const loadReviews = useCallback(async () => {
        if (!targetId) return;
        const response = targetType === 'item'
            ? await api.getItemReviews(targetId)
            : await api.getShopReviews(targetId);
        setReviews(response.data.data.reviews || []);
        setSummary(response.data.data.summary || EMPTY_SUMMARY);
    }, [targetId, targetType]);

    useEffect(() => {
        loadReviews().catch(() => {
            setReviews([]);
            setSummary(EMPTY_SUMMARY);
        });
    }, [loadReviews]);

    const saveReview = useCallback(async (payload) => {
        if (targetType === 'item') {
            await api.saveItemReview(targetId, payload);
        } else {
            await api.saveShopReview(targetId, payload);
        }
        await loadReviews();
    }, [loadReviews, targetId, targetType]);

    return { reviews, summary, loadReviews, saveReview };
}
