import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { normalizeItem, normalizeShop } from '../helpers/marketplace';

export function useShopDetail(shopId) {
  const [shop, setShop] = useState(null); const [items, setItems] = useState([]); const [similarShops, setSimilarShops] = useState([]);
  const [reviews, setReviews] = useState([]); const [summary, setSummary] = useState({ average: 0, total: 0, distribution: {} });
  const loadReviews = useCallback(async () => { const response = await api.getShopReviews(shopId); setReviews(response.data.data.reviews || []); setSummary(response.data.data.summary || { average: 0, total: 0, distribution: {} }); }, [shopId]);
  useEffect(() => { let active = true; Promise.all([api.getShopDetails(shopId), api.getShopItems(shopId), api.getSimilarShops(shopId), loadReviews()]).then(([shopResponse, itemsResponse, similar]) => { if (active) { setShop(normalizeShop(shopResponse.data.data?.shop || {})); setItems((itemsResponse.data.data.items || []).map(normalizeItem)); setSimilarShops(similar.map(normalizeShop)); } }); return () => { active = false; }; }, [shopId, loadReviews]);
  return { shop, items, similarShops, reviews, summary, loadReviews };
}
