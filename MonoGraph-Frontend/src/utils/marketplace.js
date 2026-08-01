const DEFAULT_LANGUAGE = 'en';
const LANGUAGES = ['en', 'fa', 'ps'];

// Normalizes a raw translation field (object, string, or missing) into a
// full { en: { title, description }, fa: {...}, ps: {...} } shape, so every
// consumer can safely read e.g. shop.translation.fa.title.
export const normalizeTranslation = (translation) => {
  const empty = () =>
    LANGUAGES.reduce((acc, lang) => {
      acc[lang] = { title: '', description: '' };
      return acc;
    }, {});

  if (!translation) {
    return empty();
  }

  if (typeof translation === 'string') {
    return LANGUAGES.reduce((acc, lang) => {
      acc[lang] = { title: translation, description: '' };
      return acc;
    }, {});
  }

  return LANGUAGES.reduce((acc, lang) => {
    const candidate = translation[lang];

    if (!candidate) {
      acc[lang] = { title: '', description: '' };
    } else if (typeof candidate === 'string') {
      acc[lang] = { title: candidate, description: '' };
    } else {
      acc[lang] = {
        title: candidate.title || candidate.name || '',
        description: candidate.description || candidate.note || '',
      };
    }

    return acc;
  }, {});
};

// Convenience for spots that still just want "the best available title/description"
// in a given language (e.g. list sorting, search matching) without touching translation.*
export const pickTranslation = (translation, language = DEFAULT_LANGUAGE) => {
  const normalized = normalizeTranslation(translation);
  const candidate =
    normalized[language]?.title || normalized[language]?.description
      ? normalized[language]
      : normalized.en.title || normalized.en.description
        ? normalized.en
        : normalized.fa.title || normalized.fa.description
          ? normalized.fa
          : normalized.ps;

  return candidate;
};

export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return 'Price on request';
  }

  return `Af ${Number(price).toLocaleString()}`;
};

export const formatRating = (rating = 0) => Number(rating).toFixed(1);

export const pickImageUri = (media = []) => {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  const source = media.find((entry) => entry?.url || entry?.secureUrl || entry?.path) || media[0];
  return source?.url || source?.secureUrl || source?.path || null;
};

export const normalizeItem = (item = {}) => {
  const shopTranslation = normalizeTranslation(item.shop?.translation);
  const categoryTranslation = normalizeTranslation(item.category?.translation);

  return {
    id: item._id || item.id,
    translation: normalizeTranslation(item.translation),
    price: formatPrice(item.price),
    rating: formatRating(item.rating),
    ratingCount: item.ratingCount || 0,
    image: pickImageUri(item.media),
    city: item.city || item.location?.address?.en || 'Herat',
    businessTranslation: shopTranslation,
    categoryTranslation,
    locationText: item.location?.address?.en || item.location?.address?.fa || item.city || 'Herat',
  };
};

export const normalizeShop = (shop = {}) => {
  return {
    id: shop._id || shop.id,
    translation: normalizeTranslation(shop.translation),
    rating: shop.rating,
    ratingCount: shop.ratingCount || shop.ratingsCount || 0,
    image: shop.image || pickImageUri(shop.media),
    coverImage: shop.coverImage,
    city: shop.city || 'Herat',
    shopType: shop.shopType,
    address: shop.location?.address?.en || shop.location?.address?.fa || shop.city || 'Herat',
  };
};

export const normalizeUser = (user = {}) => ({
  id: user._id || user.id,
  name: [user.name, user.lastName].filter(Boolean).join(' ').trim() || 'Your profile',
  email: user.email || 'Connected account',
  avatar: pickImageUri(user.media),
  phone: user.phone || '',
});

export const capitalize = (value = '') =>
  `${value}`.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
