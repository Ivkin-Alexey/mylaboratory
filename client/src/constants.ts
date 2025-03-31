export const BASE_API_URL = 'https://92.53.101.85/api';
export const DEFAULT_SEARCH_TERM = '';

export const apiRoutes = {
  get: {
    equipments: {
      equipments: `${BASE_API_URL}/equipments`,
      equipment: `${BASE_API_URL}/equipment`,
      search: `${BASE_API_URL}/equipments/search`,
      favorite: `${BASE_API_URL}/equipments/favorite`,
      filters: `${BASE_API_URL}/equipments/filters`,
      searchHistory: `${BASE_API_URL}/equipments/search-history`
    }
  },
  post: {
    equipments: {
      searchHistory: `${BASE_API_URL}/equipments/search-history`
    }
  },
  delete: {
    equipments: {
      favorite: `${BASE_API_URL}/equipments/favorite`,
      searchHistory: `${BASE_API_URL}/equipments/search-history`
    }
  }
};

export const encodeQueryParams = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');

  return queryParams ? `?${queryParams}` : '';
};