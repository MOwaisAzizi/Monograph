export const getConversationRole = ({ item, currentUserId }) => {
    if (!currentUserId) return "buying";
    const userId = String(currentUserId);
    const itemOwnerId = item?.owner ? String(item.owner) : null;
    return itemOwnerId === userId ? "selling" : "buying";
};

const formatAf = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "AFN";
    return `AFN ${new Intl.NumberFormat("en-US").format(number)}`;
};

export const getConversationStatusMeta = ({
    latestOffer,
    latestOrder,
    lastMessage,
}) => {
    if (latestOrder) {
        if (latestOrder.status === "cancelled") {
            return { label: "Order cancelled", pill: "cancelled" };
        }
        if (latestOrder.status === "disputed") {
            return { label: "Order disputed", pill: "rejected" };
        }
        return { label: "Order confirmed", pill: "order" };
    }

    if (latestOffer) {
        const offerPrice = latestOffer.proposedPrice ?? latestOffer.price;

        switch (latestOffer.status) {
            case "pending":
                return latestOffer.isDirectBuy
                    ? { label: "Buy request · Pending", pill: "pending" }
                    : { label: `Offer · ${formatAf(offerPrice)}`, pill: "pending" };
            case "accepted":
                return { label: "Offer accepted · propose location", pill: "accepted" };
            case "countered":
                return { label: `Offer · ${formatAf(offerPrice)}`, pill: "pending" };
            case "rejected":
                return { label: "Offer declined", pill: "rejected" };
            case "cancelled":
                return { label: "Offer cancelled", pill: "cancelled" };
            case "confirmed":
                return { label: "Order confirmed", pill: "order" };
            default:
                return { label: `Offer · ${formatAf(offerPrice)}`, pill: "pending" };
        }
    }

    const fallback = lastMessage?.content?.trim();
    return { label: fallback || "No messages yet", pill: "neutral" };
};
