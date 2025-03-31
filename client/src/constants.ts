// Константы для локальной работы
export const DEFAULT_SEARCH_TERM = '';

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