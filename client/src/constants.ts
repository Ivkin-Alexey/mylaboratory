// Константы для работы
export const DEFAULT_SEARCH_TERM = '';
export const SEARCH_PARAM_NAME = 'term'; // Название параметра для поиска оборудования во внешнем API

// API пути для внешнего API
export const API_BASE_URL = 'https://scmp-bot-server.ru/api';
export const apiRoutes = {
  EQUIPMENT: `${API_BASE_URL}/equipments/search`,
  EQUIPMENT_SEARCH: `${API_BASE_URL}/equipments/search`,
  EQUIPMENT_FIND: `${API_BASE_URL}/equipments/search`,
  EQUIPMENT_FILTER: `${API_BASE_URL}/equipments/filters`,
  EQUIPMENT_BY_ID: `${API_BASE_URL}/equipments/:id`, // Шаблон для получения оборудования по ID
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