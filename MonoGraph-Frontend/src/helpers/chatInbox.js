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

export const getConversationTitle = (conversation, language) =>
  getLocalizedValue(conversation?.item?.translation, language) || getText(language, 'itemTitleFallback');

// Right-side badge: Order status takes priority over Offer status
// (an Order only exists once an Offer is accepted, or via Buy Now).
// Falls back to a plain "Chat" label when neither exists.
// pill keys map to STATUS_STYLES / STATUS_TEXT in TalkScreen.
export const getConversationStatusBadge = ({ latestOffer, latestOrder, language = 'en' }) => {
  if (latestOrder) {
    switch (latestOrder.status) {
      case 'completed':
        return { label: getText(language, 'orderCompleted'), pill: 'order', updatedAt: latestOrder.updatedAt };
      case 'confirmed':
        return { label: getText(language, 'orderAccepted'), pill: 'order', updatedAt: latestOrder.updatedAt };
      case 'cancelled':
        return { label: getText(language, 'orderCancelled'), pill: 'cancelled', updatedAt: latestOrder.updatedAt };
      case 'pending':
      default:
        return { label: getText(language, 'orderPending'), pill: 'pending', updatedAt: latestOrder.updatedAt };
    }
  }

  if (latestOffer) {
    switch (latestOffer.status) {
      case 'confirmed':
        return { label: getText(language, 'offerAccepted'), pill: 'order', updatedAt: latestOffer.updatedAt };
      case 'cancelled':
        return { label: getText(language, 'offerCancelled'), pill: 'cancelled', updatedAt: latestOffer.updatedAt };
      case 'pending':
      default:
        return { label: getText(language, 'offerPending'), pill: 'pending', updatedAt: latestOffer.updatedAt };
    }
  }

  return { label: getText(language, 'chatLabel'), pill: 'chat', updatedAt: null };
};

// Left side, below the buyer/seller name: "You offered: AFN X" / "You ordered: AFN X".
// Order takes priority (an accepted offer becomes an order — show the order's price then).
// Returns null when there's neither, so the caller can fall back to the last chat message.
const getUserId = (value) => String(value?._id || value?.id || value || '');
const interpolate = (template, values) => Object.entries(values).reduce(
  (text, [key, value]) => text.replace(`{${key}}`, value),
  template,
);

export const getOfferPerspective = (offer, currentUserId) =>
  getUserId(offer?.buyer) === getUserId(currentUserId) ? 'byYou' : 'byOther';

export const getOfferOrderPriceLine = ({ latestOffer, latestOrder, currentUserId, language = 'en' }) => {
  const currentId = getUserId(currentUserId);
  const orderActor = getUserId(latestOrder?.buyer);
  const offerActor = getUserId(latestOffer?.buyer);

  if (latestOrder) {
    const key = orderActor === currentId ? 'orderByYou' : 'orderByOther';
    const name = latestOrder?.buyer?.fullname || getText(language, 'user');
    return interpolate(getText(language, key), { name, amount: moneyText(latestOrder.total) });
  }

  if (latestOffer) {
    const price = latestOffer.offeredPrice ?? latestOffer.askingPrice;
    const key = getOfferPerspective(latestOffer, currentUserId) === 'byYou' ? 'offerByYou' : 'offerByOther';
    const name = latestOffer?.buyer?.fullname || getText(language, 'user');
    return interpolate(getText(language, key), { name, amount: moneyText(price) });
  }

  return null;
};

export const getLastMessagePreview = ({ lastMessage, language = 'en' }) =>
  safeText(lastMessage?.content, getText(language, 'noMessagesYet'));
