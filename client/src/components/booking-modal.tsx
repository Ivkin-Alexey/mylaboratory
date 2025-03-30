import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAvailableTimeSlots } from "@/hooks/use-equipment";
import { useCreateBooking } from "@/hooks/use-bookings";
import { format } from "date-fns";
import type { Equipment } from "@shared/schema";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipment: Equipment | null;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  equipment 
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [additionalRequirements, setAdditionalRequirements] = useState<string>("");
  
  // Get minimum date (today)
  const minDate = format(new Date(), "yyyy-MM-dd");
  
  // Fetch available time slots
  const { data: availableSlots, isLoading: isLoadingSlots } = useAvailableTimeSlots(
    equipment?.id || null,
    date || null
  );
  
  // Create booking mutation
  const { mutate: createBooking, isPending } = useCreateBooking();
  
  // Reset form when modal opens with new equipment
  useEffect(() => {
    if (isOpen) {
      setDate("");
      setTimeSlot("");
      setPurpose("");
      setAdditionalRequirements("");
    }
  }, [isOpen, equipment]);
  
  // Form validation
  const isFormValid = date && timeSlot && purpose;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment || !isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createBooking({
      equipmentId: equipment.id,
      date,
      timeSlot,
      purpose,
      additionalRequirements,
      status: "confirmed", // Default status for new bookings
    }, {
      onSuccess: () => {
        onClose();
        onSuccess();
      }
    });
  };
  
  if (!equipment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book Equipment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  <img 
                    className="h-12 w-12 rounded-full object-cover" 
                    src={equipment.imageUrl || "https://via.placeholder.com/150?text=No+Image"} 
                    alt={equipment.name} 
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-md font-semibold text-gray-900">{equipment.name}</h4>
                  <p className="text-sm text-gray-500">{equipment.location}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="booking-date">Booking Date</Label>
                <Input 
                  id="booking-date" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="time-slot">Time Slot</Label>
                <Select 
                  value={timeSlot} 
                  onValueChange={setTimeSlot}
                  disabled={!date || isLoadingSlots}
                >
                  <SelectTrigger id="time-slot">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSlots ? (
                      <SelectItem value="" disabled>Loading available slots...</SelectItem>
                    ) : availableSlots && availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot.replace('-', ' - ').replace(':', ':').replace(':', ':')}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No available slots for this date</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea 
                  id="purpose" 
                  placeholder="Briefly describe your intended use"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="additional-requirements">Additional Requirements</Label>
                <Textarea 
                  id="additional-requirements" 
                  placeholder="Any special requirements or notes"
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isPending}>
              {isPending ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
