import axios from 'axios';
import { normalizeItem } from '../utils/marketplace';

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
  toggleFavorite(item, shop) {
    return this.baseURL.patch('/user/toggle-favorite', { item, shop });
  }
  toggleFollowShop(shopId) {
    return this.baseURL.post(`/shop/${shopId}/follow`);
  }
  getShopItems(shopId) {
    return this.baseURL.get(`/shop/${shopId}/items`);
  }
  getShopReviews(shopId) {
    return this.baseURL.get(`/review/shops/${shopId}`);
  }
  getShopDetails(shopId) {
    return this.baseURL.get(`/shop/${shopId}`);
  }
   similarItems(productId) {
  return this.baseURL.get(`/item/similar/${productId}`).then((res) => res.data.data);
}
  getItem(productId) {
  return this.baseURL.get(`/item/${productId}`).then((res) => normalizeItem(res.data.data));
}
}

export default new Api();
