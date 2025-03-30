import { useQuery, useMutation } from "@tanstack/react-query";
import { getEquipmentList, getEquipmentByCategory, searchEquipment, getAvailableTimeSlots } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function useEquipmentList() {
  return useQuery({
    queryKey: ["/api/equipment"],
    refetchOnWindowFocus: false,
  });
}

export function useFilteredEquipment(category: string) {
  return useQuery({
    queryKey: ["/api/equipment/category", category],
    queryFn: () => getEquipmentByCategory(category),
    enabled: !!category && category !== "all",
    refetchOnWindowFocus: false,
  });
}

export function useSearchEquipment(searchTerm: string) {
  return useQuery({
    queryKey: ["/api/equipment/search", searchTerm],
    queryFn: () => searchEquipment(searchTerm),
    enabled: !!searchTerm,
    refetchOnWindowFocus: false,
  });
}

export function useAvailableTimeSlots(equipmentId: number | null, date: string | null) {
  return useQuery({
    queryKey: ["/api/equipment/available-slots", equipmentId, date],
    queryFn: () => getAvailableTimeSlots(equipmentId!, date!),
    enabled: !!equipmentId && !!date,
    refetchOnWindowFocus: false,
  });
}
