import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import type { Booking, Equipment } from "@shared/schema";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewBookings: () => void;
  bookingDetails: {
    booking: Booking | null;
    equipment: Equipment | null;
  };
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onViewBookings,
  bookingDetails
}) => {
  const { booking, equipment } = bookingDetails;
  
  if (!booking || !equipment) return null;

  // Format time slot for display
  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot.replace('-', ' to ').replace(':', ':').replace(':', ':');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <DialogHeader className="text-center mt-4">
            <DialogTitle>Booking Confirmed</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Your booking for <span className="font-medium text-gray-900">{equipment.name}</span> has been confirmed for <span className="font-medium text-gray-900">{booking.date}</span> from <span className="font-medium text-gray-900">{formatTimeSlot(booking.timeSlot)}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg w-full">
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">Booking Details:</p>
              <ul className="list-disc pl-5 text-gray-500 space-y-1">
                <li>Booking ID: <span>BK-{booking.id}</span></li>
                <li>Equipment: <span>{equipment.name}</span></li>
                <li>Location: <span>{equipment.location}</span></li>
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
            >
              Continue Browsing
            </Button>
            <Button
              onClick={onViewBookings}
              className="sm:flex-1"
            >
              View My Bookings
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
