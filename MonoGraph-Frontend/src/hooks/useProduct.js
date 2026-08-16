import { useEffect, useState } from 'react';
import api from '../services/api';

export function useProduct(productId) {
  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getItem(productId), api.similarItems(productId)]).then(([nextItem, nextSimilarItems]) => {
      if (active) { setItem(nextItem); setSimilarItems(nextSimilarItems); }
    }).catch(() => { if (active) { setItem(null); setSimilarItems([]); } }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [productId]);
  return { item, similarItems, loading };
}

export function useFavorite(itemId, shopId = null) {
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = async () => {
    try { await api.toggleFavorite(itemId, shopId); setIsFavorite((value) => !value); } catch {}
  };
  return { isFavorite, toggleFavorite };
}
