import { useState, useEffect, useCallback } from 'react';
import type { Equipment } from '@/lib/api';

// Ключ для хранения избранного в localStorage
const FAVORITES_STORAGE_KEY = 'equipment-favorites';

/**
 * Хук для работы с избранным оборудованием
 * Использует localStorage для хранения списка ID избранного оборудования
 */
export function useFavorites() {
  // Состояние для списка ID избранного оборудования
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  // Загрузка избранного из localStorage при монтировании компонента
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного из localStorage:', error);
      // В случае ошибки просто используем пустой массив
      setFavoriteIds([]);
    }
  }, []);
  
  // Сохранение избранного в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Ошибка при сохранении избранного в localStorage:', error);
    }
  }, [favoriteIds]);
  
  // Функция для добавления оборудования в избранное
  const addToFavorites = useCallback((equipmentId: string) => {
    setFavoriteIds(prev => {
      if (prev.includes(equipmentId)) {
        return prev; // Если уже в избранном, ничего не делаем
      }
      return [...prev, equipmentId]; // Добавляем ID в массив
    });
  }, []);
  
  // Функция для удаления оборудования из избранного
  const removeFromFavorites = useCallback((equipmentId: string) => {
    setFavoriteIds(prev => prev.filter(id => id !== equipmentId));
  }, []);
  
  // Функция для переключения статуса избранного
  const toggleFavorite = useCallback((equipmentId: string) => {
    setFavoriteIds(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId); // Удаляем, если уже в избранном
      }
      return [...prev, equipmentId]; // Иначе добавляем
    });
  }, []);
  
  // Функция для проверки, добавлено ли оборудование в избранное
  const isFavorite = useCallback((equipmentId: string) => {
    return favoriteIds.includes(equipmentId);
  }, [favoriteIds]);
  
  // Функция для фильтрации списка оборудования, оставляя только избранное
  const filterFavorites = useCallback((equipmentList: Equipment[]) => {
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