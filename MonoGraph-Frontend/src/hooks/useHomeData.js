import { useEffect, useState } from 'react';
import { normalizeItem, normalizeShop } from '../helpers/marketplace';
import api from '../services/api';

const emptyData = { newItems: [], cheapItems: [], highRatedItems: [], nearestItems: [], nearestShops: [] };

export function useHomeData(categoryId) {
  const [data, setData] = useState(emptyData);

  useEffect(() => {
    let active = true;

    api.getHome(categoryId)
      .then((response) => {
        if (!active) return;

        const result = response?.data?.data || {};
        setData({
          cheapItems: (result.cheapItems || []).map(normalizeItem),
          highRatedItems: (result.highRatedItems || []).map(normalizeItem),
          newItems: (result.newItems || []).map(normalizeItem),
          nearestItems: (result.nearestItems || []).map(normalizeItem),
          nearestShops: (result.nearestShops || []).map(normalizeShop),
        });
      })
      .catch(() => { })
      .finally(() => { });

    return () => {
      active = false;
    };
  }, [categoryId]);

  return data;
}
