import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getEquipmentList,
  searchEquipment,
  findEquipment,
  getAvailableTimeSlots,
  useEquipment,
  finishUsingEquipment,
  getEquipmentFilters,
  getEquipmentById,
  getEquipmentByIds,
  ExternalFilter,
  Equipment
} from "@/lib/optimized-api";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/constants";

// Оптимизированный хук для получения списка оборудования
export function useEquipmentList() {
  return useQuery<Equipment[]>({
    queryKey: ["equipment-list"],
    queryFn: getEquipmentList,
    refetchOnWindowFocus: false, 
    staleTime: 300000, // Увеличиваем время кэширования до 5 минут для стабильности данных
    gcTime: 600000, // Кеш сохраняется 10 минут (gcTime вместо cacheTime в TanStack Query v5)
    retryOnMount: false, // Не повторяем запрос при монтировании
    retry: 1, // Максимум 1 повторная попытка при ошибке
  });
}

// Оптимизированный хук для поиска оборудования
export function useSearchEquipment(searchTerm: string) {
  return useQuery<Equipment[]>({
    queryKey: ["equipment-search", searchTerm],
    queryFn: () => searchEquipment(searchTerm),
    enabled: !!searchTerm,
    refetchOnWindowFocus: false,
    staleTime: 60000, // Кеш актуален 1 минуту
    retryOnMount: false,
    retry: 1,
    gcTime: 120000, // В v5 используется gcTime вместо cacheTime
  });
}

// Оптимизированный хук для поиска оборудования с фильтрами
export function useFindEquipment(searchTerm: string, filters?: Record<string, string[]>) {
  // Создаем стабильный хэш-ключ для фильтров, чтобы избежать ненужных перезапросов
  const filtersKey = JSON.stringify(filters || {});
  
  return useQuery<Equipment[]>({
    queryKey: ["equipment-find", searchTerm, filtersKey],
    queryFn: () => searchEquipment(searchTerm, filters),
    enabled: true, // Всегда активно, но с разными параметрами
    refetchOnWindowFocus: false,
    retry: 1, // Максимум 1 повторная попытка при ошибке
    staleTime: 60000, // Кеширование данных на 1 минуту
    gcTime: 300000, // В v5 используется gcTime вместо cacheTime
    retryOnMount: false, // Не пытаемся повторить при монтировании
  });
}

// Оптимизированный хук для получения доступных слотов времени
export function useAvailableTimeSlots(equipmentId: string | null, date: string | null) {
  return useQuery<string[]>({
    queryKey: ["available-slots", equipmentId, date],
    queryFn: () => getAvailableTimeSlots(equipmentId!, date!),
    enabled: !!equipmentId && !!date,
    refetchOnWindowFocus: false,
    staleTime: 60000, // Увеличиваем время актуальности данных до 1 минуты
    gcTime: 120000, // В v5 используется gcTime вместо cacheTime
    retry: 1, // Ограничиваем повторные запросы
    retryOnMount: false,
  });
}

// Оптимизированная мутация для отметки оборудования как используемого
export function useUseEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (equipmentId: string) => {
      return useEquipment(equipmentId);
    },
    onSuccess: (updatedEquipment, equipmentId) => {
      toast({
        title: "Статус обновлен",
        description: "Оборудование отмечено как используемое",
      });
      
      // Точечное обновление кэша вместо инвалидации всех запросов
      // Обновляем все места, где может быть это оборудование
      queryClient.setQueryData(["equipment", equipmentId], updatedEquipment);
      
      // Обновляем кэшированные списки, содержащие это оборудование
      ["equipment-list", "equipment-find", "equipment-search"].forEach(key => {
        updateEquipmentInQueryCache(queryClient, key, equipmentId, updatedEquipment);
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус оборудования",
        variant: "destructive",
      });
    }
  });
}

// Оптимизированная мутация для завершения использования оборудования
export function useFinishUsingEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (equipmentId: string) => {
      return finishUsingEquipment(equipmentId);
    },
    onSuccess: (updatedEquipment, equipmentId) => {
      toast({
        title: "Статус обновлен",
        description: "Оборудование снова доступно",
      });
      
      // Точечное обновление кэша вместо инвалидации всех запросов
      // Обновляем все места, где может быть это оборудование
      queryClient.setQueryData(["equipment", equipmentId], updatedEquipment);
      
      // Обновляем кэшированные списки, содержащие это оборудование
      ["equipment-list", "equipment-find", "equipment-search"].forEach(key => {
        updateEquipmentInQueryCache(queryClient, key, equipmentId, updatedEquipment);
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось завершить использование оборудования",
        variant: "destructive",
      });
    }
  });
}

// Вспомогательная функция для обновления оборудования в кэше запросов
function updateEquipmentInQueryCache(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: string,
  equipmentId: string,
  updatedEquipment: Equipment
) {
  // Получаем все ключи запросов, начинающиеся с данного ключа
  queryClient.getQueryCache().findAll({ queryKey: [queryKey] }).forEach(query => {
    const data = query.state.data as Equipment[] | undefined;
    if (data && Array.isArray(data)) {
      // Обновляем данные в кэше, заменяя элемент с нужным ID
      const updatedData = data.map(item => 
        item.id === equipmentId ? updatedEquipment : item
      );
      queryClient.setQueryData(query.queryKey, updatedData);
    }
  });
}

// Хук для получения фильтров с внешнего API
export function useEquipmentFilters() {
  return useQuery<ExternalFilter[]>({
    queryKey: ["equipment-filters"],
    queryFn: getEquipmentFilters,
    staleTime: 3600000, // Кэшируем фильтры на 1 час
    gcTime: 3600000, // Данные хранятся в кэше 1 час
    refetchOnWindowFocus: false
  });
}

// Хук для получения информации об оборудовании по ID
export function useEquipmentById(equipmentId: string | null) {
  return useQuery<Equipment>({
    queryKey: ["equipment", equipmentId],
    queryFn: () => getEquipmentById(equipmentId!),
    enabled: !!equipmentId, // Запрос выполняется только если есть ID
    refetchOnWindowFocus: false,
    staleTime: 60000, // Кэшируем данные на 1 минуту
    gcTime: 300000, // Данные хранятся в кэше 5 минут после использования
  });
}

// Хук для получения списка избранного оборудования по ID
export function useFavoriteEquipment(favoriteIds: string[]) {
  console.log("useFavoriteEquipment вызван с IDs:", favoriteIds);
  
  return useQuery<Equipment[]>({
    queryKey: ["favorite-equipment", favoriteIds.join(',')],
    queryFn: () => {
      console.log("Запрос избранного оборудования для IDs:", favoriteIds);
      return getEquipmentByIds(favoriteIds);
    },
    enabled: favoriteIds.length > 0, // Запрос выполняется только если есть ID в избранном
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Всегда обновляем данные при монтировании компонента
    staleTime: 0, // Всегда получаем свежие данные
    gcTime: 300000, // Данные хранятся в кэше 5 минут после использования
    retry: 1, // Минимум повторных запросов
  });
}
