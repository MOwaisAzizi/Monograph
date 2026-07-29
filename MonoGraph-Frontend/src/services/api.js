import axios from 'axios';

class Api {
  constructor() {
    this.baseURL = axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      timeout: 10000,
    });
  }

  async toggleFavorite(itemId, businessId, token) {
    try {
      const response = await this.baseURL.patch(
        '/user/toggle-favorite',
        { item: itemId, business: businessId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  async followShop(shopId, token, followingType) {
  const response = await this.baseURL.post(
    `/business/follow/${shopId}`,
    { followingType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
}

const api = new Api();

export default api;