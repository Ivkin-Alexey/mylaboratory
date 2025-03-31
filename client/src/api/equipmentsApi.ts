import { api } from './api';
import { IEquipmentItem, equipmentId } from '@/models/equipments';
import { TLogin } from '@/models/users';

export const equipmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка оборудования
    fetchAllEquipments: builder.query<IEquipmentItem[], { login: string; searchTerm?: string }>({
      query: ({ login, searchTerm }) => {
        return {
          url: `/api/equipments`,
          params: { login, searchTerm }
        };
      },
      providesTags: ['Equipment'],
    }),

    // Получение конкретного оборудования по ID
    fetchEquipmentByID: builder.query<IEquipmentItem, { equipmentId: string; login: TLogin }>({
      query: ({ equipmentId, login }) => {
        return {
          url: `/api/equipment/${equipmentId}`,
          params: { login }
        };
      },
      providesTags: (_result, _error, { equipmentId }) => [{ type: 'Equipment', id: equipmentId }],
    }),

    // Добавление оборудования в избранное
    addFavoriteEquipment: builder.mutation<string, { login: string; equipmentId: string }>({
      query: ({ login, equipmentId }) => ({
        url: `/api/equipments/favorite`,
        method: 'POST',
        params: { login, equipmentId }
      }),
      invalidatesTags: ['Favorite', 'Equipment'],
      // Оптимистичное обновление для лучшего UX
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Если запрос не удался, можно откатить оптимистичные обновления
          console.error('Failed to add equipment to favorites');
        }
      }
    }),

    // Удаление оборудования из избранного
    deleteFavoriteEquipment: builder.mutation<string, { login: string; equipmentId: string }>({
      query: ({ login, equipmentId }) => ({
        url: `/api/equipments/favorite`,
        method: 'DELETE',
        params: { login, equipmentId }
      }),
      invalidatesTags: ['Favorite', 'Equipment'],
      // Оптимистичное обновление для лучшего UX
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Если запрос не удался, можно откатить оптимистичные обновления
          console.error('Failed to remove equipment from favorites');
        }
      }
    }),
  }),
});