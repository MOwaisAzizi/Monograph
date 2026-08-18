import { describe, expect, it } from 'vitest';
import {
    getConversationRole,
    getConversationStatusMeta,
} from './conversationInbox.js';

describe('conversation inbox helpers', () => {
    it('marks the current user as selling when they own the item', () => {
        expect(
            getConversationRole({
                item: { owner: 'seller-1' },
                participants: ['buyer-1', 'seller-1'],
                currentUserId: 'seller-1',
            }),
        ).toBe('selling');
    });

    it('uses the latest offer to build the status label and pill', () => {
        const result = getConversationStatusMeta({
            latestOffer: {
                status: 'accepted',
                price: 4500,
                proposedPrice: 4500,
                isDirectBuy: false,
            },
            latestOrder: null,
            lastMessage: { content: 'Hello there' },
        });

        expect(result.pill).toBe('accepted');
        expect(result.label).toContain('Offer accepted');
    });
});
