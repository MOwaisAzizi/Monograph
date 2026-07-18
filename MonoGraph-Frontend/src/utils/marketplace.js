const DEFAULT_LANGUAGE = 'en';

export const pickTranslation = (translation, language = DEFAULT_LANGUAGE) => {
    if (!translation) {
        return { title: '', description: '' };
    }

    if (typeof translation === 'string') {
        return { title: translation, description: '' };
    }

    const candidate = translation[language] || translation.en || translation.fa || translation.ps || {};

    if (typeof candidate === 'string') {
        return { title: candidate, description: '' };
    }

    return {
        title: candidate.title || candidate.name || '',
        description: candidate.description || candidate.note || '',
    };
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
    const translation = pickTranslation(item.translation);
    const businessTranslation = pickTranslation(item.business?.translation || item.business?.translation?.en || item.business?.translation);
    const categoryTranslation = pickTranslation(item.category?.translation || item.category?.translation?.en || item.category?.translation);
console.log('item')
console.log(item)
    return {
        id: item._id || item.id,
        title: translation.title,
        description: translation.description,
        price: formatPrice(item.price),
        rating: formatRating(item.rating),
        ratingCount: item.ratingCount || 0,
        image: pickImageUri(item.media),
        city: item.city || item.location?.address?.en || 'Herat',
        businessName: businessTranslation.title || item.business?.translation?.title || item.business?.name || 'Shop name',
        categoryName: categoryTranslation.title || item.category?.translation?.title || 'Category',
        locationText: item.location?.address?.en || item.location?.address?.fa || item.city || 'Herat',
    };
};

export const normalizeBusiness = (business = {}) => {
    const translation = pickTranslation(business.translation);

    return {
        id: business._id || business.id,
        title: translation.title,
        description: translation.description,
        rating: formatRating(business.rating),
        ratingCount: business.ratingsCount || business.ratingCount || 0,
        image: pickImageUri(business.media),
        businessType: business.businessType || 'shop',
        city: business.city || 'Herat',
        address: business.location?.address?.en || business.location?.address?.fa || 'Herat',
    };
};

export const normalizeUser = (user = {}) => ({
    id: user._id || user.id,
    name: [user.name, user.lastName].filter(Boolean).join(' ').trim() || 'Your profile',
    email: user.email || 'Connected account',
    avatar: pickImageUri(user.media),
    phone: user.phone || '',
});

export const capitalize = (value = '') => `${value}`.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());