import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getHistoryTabKey,
    getUserRoleForOrder,
    getOrderStatusLabel,
    getHistoryTitle,
} from './history.js';

test('categorizes orders by the current user role', () => {
    const currentUserId = 'user-1';

    const soldOrder = {
        buyer: 'user-2',
        seller: 'user-1',
        item: { translation: { en: { title: 'Dining table' } } },
        status: 'accepted',
    };

    const boughtOrder = {
        buyer: 'user-1',
        seller: 'user-2',
        item: { translation: { en: { title: 'Lamp' } } },
        status: 'pending',
    };

    assert.equal(getUserRoleForOrder(currentUserId, soldOrder), 'sold');
    assert.equal(getUserRoleForOrder(currentUserId, boughtOrder), 'bought');
});

test('normalizes order status labels for history cards', () => {
    assert.equal(getOrderStatusLabel('pending'), 'Pending');
    assert.equal(getOrderStatusLabel('accepted'), 'accepted');
    assert.equal(getOrderStatusLabel('completed'), 'Completed');
    assert.equal(getOrderStatusLabel('cancelled'), 'Cancelled');
    assert.equal(getOrderStatusLabel('disputed'), 'Disputed');
    assert.equal(getOrderStatusLabel('rejected'), 'Rejected');
    assert.equal(getOrderStatusLabel(undefined), 'Pending');
});

test('uses the item title for history items', () => {
    const order = {
        item: {
            translation: {
                en: { title: 'Vintage camera' },
                fa: { title: 'دوربین قدیمی' },
            },
        },
    };

    assert.equal(getHistoryTitle(order, 'en'), 'Vintage camera');
    assert.equal(getHistoryTitle(order, 'fa'), 'دوربین قدیمی');
    assert.equal(getHistoryTabKey('Bought'), 'bought');
    assert.equal(getHistoryTabKey('Sold'), 'sold');
});
