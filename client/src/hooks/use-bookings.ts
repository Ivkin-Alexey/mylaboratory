import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserBookings, createBooking, cancelBooking } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { InsertBooking } from "@shared/schema";

export function useUserBookings() {
  return useQuery({
    queryKey: ["/api/bookings/user"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      
      toast({
        title: "Booking Confirmed",
        description: "Your equipment booking has been confirmed.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking. Please try again.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });
}
