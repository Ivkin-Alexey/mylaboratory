import { useState, useEffect, useCallback } from 'react';
import type { Equipment } from '@/lib/api';

// Ключ для хранения избранного в localStorage
const FAVORITES_STORAGE_KEY = 'equipment-favorites';

/**
 * Получение списка избранных ID из локального хранилища
 */
const getFavoriteIdsFromStorage = (): string[] => {
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
    console.log('Сохранено в localStorage:', ids);
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
    console.log('addToFavorites вызван:', equipmentId);
    
    setFavoriteIds(prev => {
      if (prev.includes(equipmentId)) return prev;
      return [...prev, equipmentId];
    });
  }, []);
  
  // Удаление из избранного
  const removeFromFavorites = useCallback((equipmentId: string) => {
    console.log('removeFromFavorites вызван:', equipmentId);
    
    setFavoriteIds(prev => prev.filter(id => id !== equipmentId));
  }, []);
  
  // Переключение состояния (добавить/удалить)
  const toggleFavorite = useCallback((equipmentId: string) => {
    console.log('toggleFavorite вызван для ID:', equipmentId);
    
    // Получаем текущее состояние напрямую из localStorage
    const currentFavorites = getFavoriteIdsFromStorage();
    console.log('Текущий список избранного (из localStorage):', currentFavorites);
    
    let newFavorites: string[];
    if (currentFavorites.includes(equipmentId)) {
      console.log('Удаляем из избранного:', equipmentId);
      newFavorites = currentFavorites.filter(id => id !== equipmentId);
    } else {
      console.log('Добавляем в избранное:', equipmentId);
      newFavorites = [...currentFavorites, equipmentId];
    }
    
    // Сохраняем изменения в localStorage и обновляем состояние
    saveFavoriteIdsToStorage(newFavorites);
    setFavoriteIds(newFavorites);
  }, []);
  
  // Проверка, находится ли ID в избранном
  const isFavorite = useCallback((equipmentId: string) => {
    // Получаем актуальное состояние из localStorage
    const currentFavorites = getFavoriteIdsFromStorage();
    const result = currentFavorites.includes(equipmentId);
    console.log(`isFavorite проверяет ID: ${equipmentId}, результат: ${result}`);
    return result;
  }, []);
  
  // Фильтрация списка, оставляя только избранное
  const filterFavorites = useCallback((equipmentList: Equipment[]) => {
    const currentFavorites = getFavoriteIdsFromStorage();
    return equipmentList.filter(equipment => currentFavorites.includes(equipment.id));
  }, []);
  
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