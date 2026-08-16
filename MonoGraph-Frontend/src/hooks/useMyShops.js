import { useState, useEffect } from 'react';
import api from '../services/api';

export function useMyShops(authHeader) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authHeader) {
      setShops([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;

    setLoading(true);
    api.getMyShops(authHeader)
      .then((response) => {
        const list = response?.data?.data?.shops || [];
        if (!cancelled) setShops(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
        console.log('Error loading businesses:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [authHeader?.Authorization]);

  return { shops, loading, error };
}
