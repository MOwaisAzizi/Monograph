import { useState, useEffect } from 'react';
import api from '../services/api';
import { normalizeCategory } from '../helpers/marketplace';

export function useCategories(currentLanguage) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    api
      .getCategories()
      .then((response) => {
        const list = response?.data?.data?.categories || [];
        if (!cancelled) {
          setCategories(
            Array.isArray(list)
              ? list.map((category) => normalizeCategory(category, currentLanguage))
              : [],
          );
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
        console.log('Error loading categories:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  return { categories, loading, error };
}
