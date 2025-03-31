import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getEquipmentList, 
  getEquipmentByCategory, 
  searchEquipment,
  findEquipment,
  getAvailableTimeSlots,
  useEquipment,
  finishUsingEquipment
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Equipment } from "@shared/schema";

export function useEquipmentList() {
  return useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
    queryFn: getEquipmentList,
    refetchOnWindowFocus: true, // Включаем обновление при фокусе окна
    staleTime: 60000, // Данные считаются устаревшими через 1 минуту
  });
}

export function useFilteredEquipment(category: string) {
  return useQuery<Equipment[]>({
    queryKey: ["/api/equipment/category", category],
    queryFn: () => getEquipmentByCategory(category),
    enabled: !!category && category !== "all",
    refetchOnWindowFocus: false,
  });
}

export function useSearchEquipment(searchTerm: string) {
  return useQuery<Equipment[]>({
    queryKey: ["/api/equipment/search", searchTerm],
    queryFn: () => searchEquipment(searchTerm),
    enabled: !!searchTerm,
    refetchOnWindowFocus: false,
  });
}

// Новый хук для нового API метода поиска
export function useFindEquipment(searchTerm: string) {
  return useQuery<Equipment[]>({
    queryKey: ["/api/equipment/find", searchTerm],
    queryFn: () => findEquipment(searchTerm),
    enabled: !!searchTerm,
    refetchOnWindowFocus: false,
  });
}

export function useAvailableTimeSlots(equipmentId: number | null, date: string | null) {
  return useQuery<string[]>({
    queryKey: ["/api/equipment/available-slots", equipmentId, date],
    queryFn: () => getAvailableTimeSlots(equipmentId!, date!),
    enabled: !!equipmentId && !!date,
    refetchOnWindowFocus: false,
    staleTime: 30000, // Кэш результата на 30 секунд
    gcTime: 60000, // Храним в кэше 1 минуту (в v5 cacheTime переименовано в gcTime)
  });
}

// Мутация для отметки оборудования как используемого
export function useUseEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (equipmentId: number) => {
      return useEquipment(equipmentId);
    },
    onSuccess: () => {
      toast({
        title: "Статус обновлен",
        description: "Оборудование отмечено как используемое",
      });
      // После успешного изменения статуса инвалидируем все запросы к оборудованию
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус оборудования",
        variant: "destructive",
      });
      console.error("Ошибка при использовании оборудования:", error);
    }
  });
}

// Мутация для завершения использования оборудования
export function useFinishUsingEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (equipmentId: number) => {
      return finishUsingEquipment(equipmentId);
    },
    onSuccess: () => {
      toast({
        title: "Статус обновлен",
        description: "Оборудование снова доступно",
      });
      // После успешного изменения статуса инвалидируем все запросы к оборудованию
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось завершить использование оборудования",
        variant: "destructive",
      });
      console.error("Ошибка при завершении использования:", error);
    }
  });
}
