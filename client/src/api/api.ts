import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from '@/constants';

export const api = createApi({
  reducerPath: 'equipmentsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_API_URL 
  }),
  tagTypes: ['Equipment', 'Favorite'],
  endpoints: () => ({})
});