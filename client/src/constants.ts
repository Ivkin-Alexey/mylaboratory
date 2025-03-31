// Константы для локальной работы
export const DEFAULT_SEARCH_TERM = '';
export const SEARCH_PARAM_NAME = 'q'; // Название параметра для поиска оборудования

// API пути для внешнего API
export const apiRoutes = {
  EQUIPMENT: '/api/equipment',
  EQUIPMENT_SEARCH: '/api/equipment/search',
  EQUIPMENT_FIND: '/api/equipment/find',
  EQUIPMENT_FILTER: '/api/equipment/filters',
  EQUIPMENT_DETAILS: '/api/equipment',
  AVAILABLE_SLOTS: '/api/equipment/available-slots',
  BOOKINGS: '/api/bookings',
  BOOKINGS_USER: '/api/bookings/user',
  EQUIPMENT_USE: '/api/equipment/use',
  EQUIPMENT_FINISH: '/api/equipment/finish',
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