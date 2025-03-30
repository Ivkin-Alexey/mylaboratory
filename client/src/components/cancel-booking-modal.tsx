import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useCancelBooking } from "@/hooks/use-bookings";
import type { BookingWithEquipment } from "@shared/schema";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingWithEquipment | null;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const { mutate: cancelBooking, isPending } = useCancelBooking();
  
  if (!booking) return null;

  // Format time slot for display
  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot.replace('-', ' to ').replace(':', ':').replace(':', ':');
  };
  
  const handleCancel = () => {
    cancelBooking(booking.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <DialogHeader className="text-center mt-4">
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Are you sure you want to cancel your booking for <span className="font-medium text-gray-900">{booking.equipment.name}</span> on <span className="font-medium text-gray-900">{booking.date}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg w-full">
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">Booking Details:</p>
              <ul className="list-disc pl-5 text-gray-500 space-y-1">
                <li>Booking ID: <span>BK-{booking.id}</span></li>
                <li>Equipment: <span>{booking.equipment.name}</span></li>
                <li>Date: <span>{booking.date}</span></li>
                <li>Time: <span>{formatTimeSlot(booking.timeSlot)}</span></li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex sm:flex-row sm:justify-center gap-2 mt-6 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="sm:flex-1"
              disabled={isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              className="sm:flex-1"
              disabled={isPending}
            >
              {isPending ? "Cancelling..." : "Yes, Cancel Booking"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingModal;
