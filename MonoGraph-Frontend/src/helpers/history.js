import { getLocalizedValue } from '../i18n';

const ORDER_STATUS_DISPLAY = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export const getHistoryTabKey = (label = '') => {
    const normalized = `${label}`.trim().toLowerCase();
    if (normalized === 'sold') return 'sold';
    if (normalized === 'bought') return 'bought';
    if (normalized === 'buying') return 'bought';
    if (normalized === 'selling') return 'sold';
    return 'bought';
};

export const getUserRoleForOrder = (currentUserId, order = {}) => {
    const userId = `${currentUserId || ''}`;
    const buyerId = `${order?.buyer?._id || order?.buyer || ''}`;
    const sellerId = `${order?.seller?._id || order?.seller || ''}`;

    if (buyerId === userId && sellerId !== userId) return 'bought';
    if (sellerId === userId && buyerId !== userId) return 'sold';
    return 'bought';
};

export const getOrderStatusLabel = (status) => ORDER_STATUS_DISPLAY[status] || 'Pending';

export const getHistoryTitle = (order = {}, language = 'en') => {
    const item = order?.item || {};
    const translation = item.translation || {};
    const title = getLocalizedValue(translation, language, 'title') || getLocalizedValue(translation, 'en', 'title');

    if (title) return title;
    return item.name || item.title || 'Item';
};

export const getHistoryPrice = (order = {}) => {
    const value = order?.total ?? order?.subtotal ?? order?.amount ?? 0;
    const price = Number(value);
    return Number.isFinite(price) ? price : 0;
};

export const getHistoryImage = (order = {}) => {
    const item = order?.item || {};
    const media = item.media || [];

    if (Array.isArray(media) && media.length > 0) {
        const first = media[0];
        if (typeof first === 'string') return first;
        return first?.url || first?.image || null;
    }

    if (item.coverImage) return item.coverImage;
    if (item.image) return item.image;

    return 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80';
};
