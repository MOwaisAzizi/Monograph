import { useState, useEffect } from 'react';
import api from '../services/api';

export function useMyItems(authHeader) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authHeader) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;

    setLoading(true);
    api.getMyItems(authHeader)
      .then((response) => {
        const list = response?.data?.data?.items || response?.data?.data?.Items || [];
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
        console.log('Error loading owned items:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [authHeader?.Authorization]);

  return { items, loading, error };
}
