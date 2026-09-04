import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { normalizeItem, normalizeShop } from '../helpers/marketplace';
import { useReviews } from './useReviews';

export function useShopDetail(shopId) {
  const [shop, setShop] = useState(null);
  const [items, setItems] = useState([]);
  const [similarShops, setSimilarShops] = useState([]);
  const { reviews, summary, loadReviews, saveReview } = useReviews('shop', shopId);
  useEffect(() => {
    let active = true;
    Promise.all([
      api.getShopDetails(shopId),
      api.getShopItems(shopId),
      api.getSimilarShops(shopId),
    ]).then(([shopResponse, itemsResponse, similar]) => {
      if (active) {
        setShop(shopResponse || null);
        setItems((itemsResponse.data.data.items || []).map(normalizeItem));
        setSimilarShops(similar.map(normalizeShop));
      }
    });
    return () => {
      active = false;
    };
  }, [shopId]);
  return { shop, items, similarShops, reviews, summary, loadReviews, saveReview };
}
