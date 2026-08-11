const DEFAULT_LANGUAGE = 'en';
const LANGUAGES = ['en', 'fa', 'ps'];

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
        title: candidate.title || '',
        description: candidate.description || candidate.note || '',
      };
    }

    return acc;
  }, empty());
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

export const  formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return 'Price on request';
  }

  return `Af ${Number(price).toLocaleString()}`;
};

export const formatRating = (rating = 0) => Number(rating).toFixed(1);

export const pickImageUri = (media = [], type = 'cover') => {
  if (!media) return null;

  // Shops/items store an array, while a user stores one media object.  Always
  // return the URL React Native's <Image> expects, never the media object.
  const entries = Array.isArray(media) ? media : [media];
  const source = entries.find((image) => image?.type === type) || entries[0];
  return typeof source === 'string' ? source : source?.url || null;
};

export const normalizeItem = (item = {}) => {
  const translation = normalizeTranslation(item.translation);
  const shopTranslation = normalizeTranslation(item.shop?.translation);
  const categoryTranslation = normalizeTranslation(item.category?.translation);
console.log('🍿🍿🍿🌭🍟')
console.log(item)
console.log('item')
console.log('🍿🍿🍿🌭🍟')
  const data =  {
    id: item._id || item.id,
    translation,
    price: formatPrice(item.price),
    rating: formatRating(item.rating),
    coverImage: pickImageUri(item.media, 'cover'),
    city: item.city || item.location?.address?.en || 'Herat',
    shopTranslation, // shopTranslation.en.title / .fa.title / .ps.title
    shopId: item.shop?._id || item.shop?.id || item.shop,
    shopType: item.shop?.shopType || '',
    distance: item.distance || 5,
    categoryTranslation, // categoryTranslation.en.title / .fa.title / .ps.title
    locationText: item.location?.address?.en || item.location?.address?.fa || item.city || 'Herat',
  };
  console.log(data)
console.log('🍿🍿🍿🌭🍟')

  return data;
};

export const normalizeShop = (shop = {}) => {
  const translation = normalizeTranslation(shop.translation);

  return {
    id: shop._id || shop.id,
    translation, // translation.en.title / translation.fa.title / translation.ps.title
    rating: shop.rating,
    profile: pickImageUri(shop.media, 'profile'),
    coverImage: pickImageUri(shop.media, 'cover'),
    city: shop.city || 'Herat',
    shopType: shop.shopType,
    address: shop.location?.address?.en || shop.location?.address?.fa || shop.city || 'Herat',
  };
};

export const normalizeUser = (user = {}) => ({
  id: user._id || user.id,
  fullname: user.fullname || 'Your profile',
  email: user.email || 'Connected account',
  avatar: pickImageUri(user.media, 'profile'),
  phone: user.phone || '',
  address: user.location?.address?.en || user.location?.address?.fa || user.location?.address?.ps || '',
  location: user.location || null,
  preferredLanguage: user.preferredLanguage || 'en',
});

export const capitalize = (value = '') =>
  `${value}`.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
