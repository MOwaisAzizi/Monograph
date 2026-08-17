import axios from 'axios';
import { normalizeItem, normalizeShop } from '../helpers/marketplace';

const isMultipartPayload = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (typeof FormData !== 'undefined' && data instanceof FormData) return true;
  return typeof data.append === 'function';
};

const serializeJsonPayload = (data) => {
  if (data === undefined || data === null) return data;
  if (typeof data === 'string') return data;
  if (isMultipartPayload(data)) return data;
  if (typeof data === 'object') return JSON.stringify(data);
  return data;
};

class Api {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.onTokensChanged = null;
    this.onUnauthorized = null;
    this.baseURL = axios.create({ baseURL: 'http://localhost:8000/api/v1', timeout: 10000 });
    this.baseURL.interceptors.request.use((config) => {
      const headers = { ...(config.headers || {}) };

      if (this.accessToken && !headers.Authorization)
        headers.Authorization = `Bearer ${this.accessToken}`;

      if (
        config.data !== undefined &&
        config.data !== null &&
        !isMultipartPayload(config.data) &&
        !headers['Content-Type']?.includes('multipart/form-data')
      ) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        config.data = serializeJsonPayload(config.data);
      }

      config.headers = headers;
      return config;
    });
    this.baseURL.interceptors.response.use(
      (response) => response,
      async (error) => {
        const request = error.config;
        if (
          error.response?.status !== 401 ||
          request?._retry ||
          request?.url?.includes('/user/refresh-token') ||
          !this.refreshToken
        )
          return Promise.reject(error);
        request._retry = true;
        try {
          const response = await axios.post(`${this.baseURL.defaults.baseURL}/user/refresh-token`, {
            refreshToken: this.refreshToken,
          });
          this.accessToken = response.data.accessToken;
          this.onTokensChanged?.({
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
          });
          request.headers.Authorization = `Bearer ${this.accessToken}`;
          return this.baseURL(request);
        } catch (refreshError) {
          this.clearSession();
          return Promise.reject(refreshError);
        }
      },
    );
  }

  setSession({ accessToken, refreshToken }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
  clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.onUnauthorized?.();
  }
  setAuthCallbacks({ onTokensChanged, onUnauthorized }) {
    this.onTokensChanged = onTokensChanged;
    this.onUnauthorized = onUnauthorized;
  }
  // Auth
  login(credentials) {
    return this.baseURL.post('/user/login', credentials);
  }
  register(credentials) {
    return this.baseURL.post('/user/signup', credentials);
  }
  logout() {
    return this.baseURL.post('/user/logout');
  }

  // Shop
  createShop(payload, headers) {
    return this.baseURL.post('/shop', payload, { headers });
  }
  updateShop(shopId, payload, headers) {
    return this.baseURL.patch(`/shop/${shopId}`, payload, { headers });
  }
  toggleFavorite(item, shop) {
    return this.baseURL.patch('/user/toggle-favorite', { item, shop });
  }
  toggleFollowShop(shopId) {
    return this.baseURL.post(`/shop/follow/${shopId}`);
  }
  getShopItems(shopId) {
    return this.baseURL.get(`/shop/${shopId}/items`);
  }
  getShopReviews(shopId) {
    return this.baseURL.get(`/review/shops/${shopId}`);
  }
  getShopDetails(shopId) {
    return this.baseURL.get(`/shop/${shopId}`).then((res)=> normalizeShop(res.data.data.shop));
  }

  // Item
  createItem(payload, headers) {
    return this.baseURL.post('/item', payload, { headers });
  }
  updateItem(itemId, payload, headers) {
    return this.baseURL.patch(`/item/${itemId}`, payload, { headers });
  }
  getSimilarShops(shopId) {
    return this.baseURL.get(`/shop/${shopId}/similar`).then((res) => res.data.data.shops || []);
  }
  similarItems(productId) {
    return this.baseURL
      .get(`/item/similar/${productId}`)
      .then((res) => (res.data.data || []).map(normalizeItem));
  }
  getItem(productId) {
    return this.baseURL.get(`/item/${productId}`).then((res) => normalizeItem(res.data.data.item));
  }
  getProfile() {
    return this.baseURL.get('/user/profile').then((res) => res.data.data.user);
  }
  updateProfile(payload) {
    return this.baseURL.patch('/user/profile', payload).then((res) => res.data.data.user);
  }
  getTypes() {
    return this.baseURL.get('/category/').then((res) => res.data.data.categories || []);
  }

  getMyItems(authHeader) {
    return this.baseURL.get('/item/mine', { headers: authHeader });
  }
  getMyShops(authHeader) {
    return this.baseURL.get('/shop/mine', { headers: authHeader });
  }
  getCategories() {
    return this.baseURL.get('/category');
  }
  getHome(categoryId = '') {
    return this.baseURL.get(
      `/home${categoryId ? `?category=${encodeURIComponent(categoryId)}` : ''}`,
    );
  }
  search(query) {
    return this.baseURL.get(`/search?${query}`);
  }
  createOffer(payload) {
    return this.baseURL.post('/offer', payload);
  }
  getOffers() {
    return this.baseURL.get('/offer');
  }
  respondToOffer(offerId, payload) {
    return this.baseURL.patch(`/offer/${offerId}/respond`, payload);
  }
  openConversation(payload) {
    return this.baseURL.post('/conversation/open', payload);
  }
  listConversations() {
    return this.baseURL.get('/conversation');
  }
  getConversationMessages(conversationId) {
    return this.baseURL.get(`/conversation/${conversationId}/messages`);
  }
  sendConversationMessage(conversationId, payload) {
    return this.baseURL.post(`/conversation/${conversationId}/messages`, payload);
  }
  updatePreferredLanguage(payload, headers) {
    return this.baseURL.patch('/user/profile', payload, { headers });
  }
  saveShopReview(shopId, payload) {
    return this.baseURL.post(`/review/shops/${shopId}`, payload);
  }
}

export default new Api();
