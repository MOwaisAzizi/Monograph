import axios from 'axios';

class Api {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.onTokensChanged = null;
    this.onUnauthorized = null;
    this.baseURL = axios.create({ baseURL: 'http://localhost:8000/api/v1', timeout: 10000 });
    this.baseURL.interceptors.request.use((config) => {
      if (this.accessToken && !config.headers.Authorization)
        config.headers.Authorization = `Bearer ${this.accessToken}`;
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
  saveShopReview(shopId, review) {
    return this.baseURL.post(`/review/shops/${shopId}`, review);
  }
}

export default new Api();
