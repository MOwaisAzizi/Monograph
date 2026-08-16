export const ALL_CATEGORY = { key: '', label: 'All', icon: 'grid' };

export const normalizeCategoryFilters = (categories = [], language = 'en') =>
  categories.map((category) => {
    const translation = category.translation?.[language] ?? category.translation?.en ?? {};
    return {
      key: category._id || category.id || '',
      label: typeof translation === 'string' ? translation : translation.title || '',
      icon: category.icon || 'pricetag',
    };
  });
