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
      case 'accepted':
        return { label: getText(language, 'orderAccepted'), pill: 'order', updatedAt: latestOrder.updatedAt };
      case 'rejected':
        return { label: getText(language, 'orderRejected'), pill: 'rejected', updatedAt: latestOrder.updatedAt };
      case 'pending':
      default:
        return { label: getText(language, 'orderPending'), pill: 'pending', updatedAt: latestOrder.updatedAt };
    }
  }

  if (latestOffer) {
    switch (latestOffer.status) {
      case 'accepted':
        return { label: getText(language, 'offerAccepted'), pill: 'accepted', updatedAt: latestOffer.updatedAt };
      case 'rejected':
        return { label: getText(language, 'offerDeclined'), pill: 'rejected', updatedAt: latestOffer.updatedAt };
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
export const getOfferOrderPriceLine = ({ latestOffer, latestOrder, currentUserId, language = 'en' }) => {
  const isSeller = (record) =>
    String(record?.seller?._id || record?.seller || '') === String(currentUserId || '');

  if (latestOrder) {
    return `${isSeller(latestOrder) ? 'Order Received:' : getText(language, 'youOrdered')} ${moneyText(latestOrder.total)}`;
  }

  if (latestOffer) {
    const price = latestOffer.offeredPrice ?? latestOffer.askingPrice;
    return `${isSeller(latestOffer) ? 'Offer Received:' : getText(language, 'youOffered')} ${moneyText(price)}`;
  }

  return null;
};

export const getLastMessagePreview = ({ lastMessage, language = 'en' }) =>
  safeText(lastMessage?.content, getText(language, 'noMessagesYet'));
