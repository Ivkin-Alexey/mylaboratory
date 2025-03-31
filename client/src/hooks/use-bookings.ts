import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserBookings, createBooking, cancelBooking, InsertBooking } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function useUserBookings() {
  return useQuery({
    queryKey: ["user-bookings"],
    queryFn: getUserBookings,
    refetchOnWindowFocus: false,
  });
}

export function useCreateBooking() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (bookingData: Omit<InsertBooking, "userId">) => 
      createBooking(bookingData),
    onSuccess: () => {
      // Invalidate both equipment and bookings queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      
      toast({
        title: "Бронирование подтверждено",
        description: "Ваше бронирование оборудования подтверждено.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка бронирования",
        description: error instanceof Error ? error.message : "Не удалось создать бронирование. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });
}

export function useCancelBooking() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: () => {
      // Invalidate both equipment and bookings queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      
      toast({
        title: "Бронирование отменено",
        description: "Ваше бронирование было успешно отменено.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка отмены",
        description: error instanceof Error ? error.message : "Не удалось отменить бронирование. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });
}
