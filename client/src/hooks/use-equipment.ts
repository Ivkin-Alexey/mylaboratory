import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getEquipmentList,
  searchEquipment,
  findEquipment,
  getAvailableTimeSlots,
  useEquipment,
  finishUsingEquipment,
  getEquipmentFilters,
  ExternalFilter,
  Equipment
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/constants";

export function useEquipmentList() {
  return useQuery<Equipment[]>({
    queryKey: ["equipment-list"],
    queryFn: getEquipmentList,
    refetchOnWindowFocus: false, 
    staleTime: 60000,
  });
}

export function useSearchEquipment(searchTerm: string) {
  return useQuery<Equipment[]>({
    queryKey: ["equipment-search", searchTerm],
    queryFn: () => searchEquipment(searchTerm),
    enabled: !!searchTerm,
    refetchOnWindowFocus: false,
  });
}

export function useFindEquipment(searchTerm: string, filters?: Record<string, string[]>) {
  return useQuery<Equipment[]>({
    queryKey: ["equipment-find", searchTerm, filters],
    queryFn: () => searchEquipment(searchTerm, filters),
    enabled: !!searchTerm || (filters && Object.values(filters).some(values => values.length > 0)),
    refetchOnWindowFocus: false,
  });
}

export function useAvailableTimeSlots(equipmentId: number | null, date: string | null) {
  return useQuery<string[]>({
    queryKey: ["available-slots", equipmentId, date],
    queryFn: () => getAvailableTimeSlots(equipmentId!, date!),
    enabled: !!equipmentId && !!date,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 60000,
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
      queryClient.invalidateQueries({ queryKey: ["equipment-list"] });
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
      queryClient.invalidateQueries({ queryKey: ["equipment-list"] });
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
