import { useState, useEffect, useCallback } from 'react';
import type { Equipment } from '@/lib/optimized-api';

// Ключ для хранения избранного в localStorage
const FAVORITES_STORAGE_KEY = 'equipment-favorites';

/**
 * Получение списка избранных ID из локального хранилища
 */
export const getFavoriteIdsFromStorage = (): string[] => {
  try {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  } catch (error) {
    console.error('Ошибка при загрузке избранного из localStorage:', error);
    return [];
  }
};

/**
 * Сохранение списка избранных ID в локальное хранилище
 */
const saveFavoriteIdsToStorage = (ids: string[]): void => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Ошибка при сохранении избранного в localStorage:', error);
  }
};

/**
 * Хук для работы с избранным оборудованием
 * Использует localStorage для хранения списка ID избранного оборудования
 */
export function useFavorites() {
  // Инициализация состояния из localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteIdsFromStorage());
  
  // Синхронизация состояния и localStorage
  useEffect(() => {
    saveFavoriteIdsToStorage(favoriteIds);
  }, [favoriteIds]);
  
  // Добавление в избранное
  const addToFavorites = useCallback((equipmentId: string) => {
    setFavoriteIds(prev => {
      if (prev.includes(equipmentId)) return prev;
      return [...prev, equipmentId];
    });
  }, []);
  
  // Удаление из избранного
  const removeFromFavorites = useCallback((equipmentId: string) => {
    setFavoriteIds(prev => prev.filter(id => id !== equipmentId));
  }, []);
  
  // Переключение состояния (добавить/удалить)
  const toggleFavorite = useCallback((equipmentId: string) => {
    // Получаем текущее состояние напрямую из localStorage
    const currentFavorites = getFavoriteIdsFromStorage();
    
    let newFavorites: string[];
    if (currentFavorites.includes(equipmentId)) {
      newFavorites = currentFavorites.filter(id => id !== equipmentId);
    } else {
      newFavorites = [...currentFavorites, equipmentId];
    }
    
    // Сохраняем изменения в localStorage и обновляем состояние
    saveFavoriteIdsToStorage(newFavorites);
    setFavoriteIds(newFavorites);
  }, []);
  
  // Проверка, находится ли ID в избранном
  const isFavorite = useCallback((equipmentId: string) => {
    // Используем текущее состояние из хука вместо чтения localStorage каждый раз
    return favoriteIds.includes(equipmentId);
  }, [favoriteIds]);
  
  // Фильтрация списка, оставляя только избранное
  const filterFavorites = useCallback((equipmentList: Equipment[]) => {
    // Используем текущее значение из хука вместо чтения localStorage
    return equipmentList.filter(equipment => favoriteIds.includes(equipment.id));
  }, [favoriteIds]);
  
  return {
    favoriteIds,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    filterFavorites,
    hasFavorites: favoriteIds.length > 0
  };
}