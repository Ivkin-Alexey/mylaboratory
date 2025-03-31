import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { IEquipmentItem } from '@/models/equipments';
import { useToast } from './use-toast';
import { DEFAULT_SEARCH_TERM, BASE_API_URL, encodeQueryParams, apiRoutes } from '@/constants';

/**
 * Хук для получения списка внешнего оборудования
 */
export function useExternalEquipmentList(searchTerm: string = DEFAULT_SEARCH_TERM) {
  const params = {
    searchTerm,
    login: 'user1'
  };

  const encodedParams = encodeQueryParams(params);
  // Правильный URL для запроса к API с поддержкой HTTPS
  const url = `${apiRoutes.get.equipments.equipments}${encodedParams}`;

  return useQuery({
    queryKey: ['externalEquipment', searchTerm],
    queryFn: async () => {
      console.log('Выполняем запрос к URL:', url);
      
      // Делаем запрос без try/catch, чтобы TanStack Query мог обработать ошибки
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText || 'Проблема с доступом к внешнему API'}`);
      }
      
      const data = await response.json();
      console.log('Получены данные:', data);
      return data as IEquipmentItem[];
    },
    retry: 1, // Повторить запрос только один раз при ошибке
    refetchOnWindowFocus: false // Не обновлять при фокусе окна
  });
}

/**
 * Хук для получения детальной информации о внешнем оборудовании
 */
export function useExternalEquipmentById(equipmentId: string) {
  const url = `${apiRoutes.get.equipments.equipments}/${equipmentId}?login=user1`;
  
  return useQuery({
    queryKey: ['externalEquipment', equipmentId],
    queryFn: async () => {
      console.log('Выполняем запрос к URL для получения информации об оборудовании:', url);
      
      // Делаем запрос без try/catch, чтобы TanStack Query мог обработать ошибки
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText || 'Проблема с доступом к внешнему API'}`);
      }
      
      const data = await response.json();
      return data as IEquipmentItem;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!equipmentId
  });
}

/**
 * Хук для добавления/удаления оборудования из избранного
 */
export function useFavoriteEquipment() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Функция для переключения избранного
  const toggleFavorite = async (equipmentId: number, isFavorite: boolean | undefined) => {
    setIsLoading(true);
    try {
      const url = apiRoutes.get.equipments.favorite;
      const method = isFavorite ? 'DELETE' : 'POST';
      
      // Преобразуем ID в строку, если необходимо
      const stringId = equipmentId.toString();
      
      const response = await fetch(`${url}?login=user1&equipmentId=${stringId}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при обновлении избранного');
      }
      
      toast({
        title: 'Успешно',
        description: isFavorite 
          ? 'Оборудование удалено из избранного' 
          : 'Оборудование добавлено в избранное',
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить избранное',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleFavorite,
    isLoading
  };
}