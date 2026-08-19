import { getLocalizedValue, getText } from '../i18n';

const moneyText = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return 'AFN 0';
    return `AFN ${new Intl.NumberFormat('en-US').format(number)}`;
};

const safeText = (value, fallback = '') => (value && String(value).trim() ? value : fallback);

export const getItemImageUri = (item = {}) => {
    const media = item?.media || [];
    if (Array.isArray(media) && media.length > 0) {
        const direct = media.find((entry) => entry?.type === 'cover') || media[0];
        return direct?.url || direct || null;
    }

    return item?.coverImage || null;
};

export const getConversationInboxStatus = ({ latestOffer, latestOrder, lastMessage, language = 'en' }) => {
    if (latestOrder) {
        if (latestOrder.status === 'cancelled') {
            return { text: getText(language, 'orderCancelled'), pill: 'cancelled' };
        }
        if (latestOrder.status === 'disputed') {
            return { text: getText(language, 'orderDisputed'), pill: 'rejected' };
        }
        return { text: getText(language, 'orderConfirmed'), pill: 'order' };
    }

    if (latestOffer) {
        const offerPrice = latestOffer.offeredPrice ?? latestOffer.askingPrice ?? null;
        switch (latestOffer.status) {
            case 'pending':
                return latestOffer.isDirectBuy
                    ? { text: getText(language, 'buyRequestPending'), pill: 'pending' }
                    : { text: `${getText(language, 'offerPrefix')} ${moneyText(offerPrice)}`, pill: 'pending' };
            case 'accepted':
                return { text: getText(language, 'offerAccepted'), pill: 'accepted' };
            case 'countered':
                return { text: `${getText(language, 'offerPrefix')} ${moneyText(offerPrice)}`, pill: 'pending' };
            case 'rejected':
                return { text: getText(language, 'offerDeclined'), pill: 'rejected' };
            case 'cancelled':
                return { text: getText(language, 'offerCancelled'), pill: 'cancelled' };
            case 'accepted':
                return { text: getText(language, 'orderConfirmed'), pill: 'order' };
            default:
                return { text: `${getText(language, 'offerPrefix')} ${moneyText(offerPrice)}`, pill: 'pending' };
        }
    }

    return {
        text: safeText(lastMessage?.content, getText(language, 'noMessagesYet')),
        pill: 'neutral',
    };
};

export const getConversationTitle = (conversation, language) =>
    getLocalizedValue(conversation?.item?.translation, language) || getText(language, 'itemTitleFallback');
