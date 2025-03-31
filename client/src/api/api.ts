import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'equipmentsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api' // Используем относительный путь для локального API
  }),
  tagTypes: ['Equipment', 'Favorite'],
  endpoints: () => ({})
});