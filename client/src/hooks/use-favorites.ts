import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
 * Оптимизирован для предотвращения лишних рендеров
 */
export function useFavorites() {
  // Создаем ref для кэша, который не вызывает ререндер при изменении
  const favoritesCache = useRef<Set<string>>(new Set(getFavoriteIdsFromStorage()));
  
  // Инициализируем состояние только один раз, дальше используем ref для перерисовки
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => Array.from(favoritesCache.current));
  
  // Обновление кэша без вызова перерисовки
  const updateCache = useCallback((newIds: string[]) => {
    // Обновляем кэш
    favoritesCache.current = new Set(newIds);
    // Сохраняем в localStorage
    saveFavoriteIdsToStorage(newIds);
    // Обновляем состояние компонента (вызывает ререндер)
    setFavoriteIds(newIds);
  }, []);
  
  // Синхронизируем состояние с другими вкладками через событие storage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) {
        const newFavorites = e.newValue ? JSON.parse(e.newValue) : [];
        updateCache(newFavorites);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateCache]);
  
  // Добавление в избранное с оптимизацией
  const addToFavorites = useCallback((equipmentId: string) => {
    if (!favoritesCache.current.has(equipmentId)) {
      const newFavorites = [...Array.from(favoritesCache.current), equipmentId];
      updateCache(newFavorites);
    }
  }, [updateCache]);
  
  // Удаление из избранного с оптимизацией
  const removeFromFavorites = useCallback((equipmentId: string) => {
    if (favoritesCache.current.has(equipmentId)) {
      const newFavorites = Array.from(favoritesCache.current).filter(id => id !== equipmentId);
      updateCache(newFavorites);
    }
  }, [updateCache]);
  
  // Оптимизированное переключение состояния
  const toggleFavorite = useCallback((equipmentId: string) => {
    if (favoritesCache.current.has(equipmentId)) {
      const newFavorites = Array.from(favoritesCache.current).filter(id => id !== equipmentId);
      updateCache(newFavorites);
    } else {
      const newFavorites = [...Array.from(favoritesCache.current), equipmentId];
      updateCache(newFavorites);
    }
  }, [updateCache]);
  
  // Быстрая проверка наличия в избранном с использованием Set для O(1) сложности
  const isFavorite = useCallback((equipmentId: string) => {
    return favoritesCache.current.has(equipmentId);
  }, []); // Удаляем зависимость от favoriteIds для предотвращения ререндеров
  
  // Мемоизированная фильтрация списка
  const filterFavorites = useCallback((equipmentList: Equipment[]) => {
    const favorites = favoritesCache.current;
    return equipmentList.filter(equipment => favorites.has(equipment.id));
  }, []); // Удаляем зависимость от favoriteIds для предотвращения ререндеров
  
  // Мемоизированное свойство наличия избранного
  const hasFavorites = useMemo(() => 
    favoritesCache.current.size > 0, 
    [favoriteIds] // Обновляем только при изменении состояния
  );
  
  return {
    favoriteIds,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    filterFavorites,
    hasFavorites
  };
}