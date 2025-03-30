import { useQuery, useMutation } from "@tanstack/react-query";
import { getEquipmentList, getEquipmentByCategory, searchEquipment, getAvailableTimeSlots } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Equipment } from "@shared/schema";

export function useEquipmentList() {
  return useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
    queryFn: getEquipmentList,
    refetchOnWindowFocus: true, // Включаем обновление при фокусе окна
    staleTime: 1000, // Данные считаются устаревшими через 1 секунду
    refetchInterval: 3000, // Обновляем данные каждые 3 секунды автоматически
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
