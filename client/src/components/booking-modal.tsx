import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Avatar,
  SelectChangeEvent,
  Paper
} from "@mui/material";
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

  const handleTimeSlotChange = (event: SelectChangeEvent) => {
    setTimeSlot(event.target.value);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Book Equipment
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ pt: 1 }}>
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={equipment.imageUrl || "https://via.placeholder.com/150?text=No+Image"}
                  alt={equipment.name}
                  sx={{ width: 56, height: 56 }}
                />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {equipment.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {equipment.location}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                id="booking-date" 
                label="Booking Date"
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                inputProps={{ min: minDate }}
                required
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth disabled={!date || isLoadingSlots}>
                <InputLabel id="time-slot-label">Time Slot</InputLabel>
                <Select
                  labelId="time-slot-label"
                  id="time-slot"
                  value={timeSlot}
                  onChange={handleTimeSlotChange}
                  label="Time Slot"
                >
                  {isLoadingSlots ? (
                    <MenuItem value="" disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading available slots...
                      </Box>
                    </MenuItem>
                  ) : availableSlots && availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot.replace('-', ' - ').replace(':', ':').replace(':', ':')}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No available slots for this date
                    </MenuItem>
                  )}
                </Select>
                {!date && <FormHelperText>Please select a date first</FormHelperText>}
              </FormControl>
              
              <TextField
                fullWidth
                id="purpose"
                label="Purpose"
                placeholder="Briefly describe your intended use"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                multiline
                rows={3}
              />
              
              <TextField
                fullWidth
                id="additional-requirements"
                label="Additional Requirements"
                placeholder="Any special requirements or notes"
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                multiline
                rows={2}
              />
            </Box>
          </Box>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!isFormValid || isPending}
          color="primary"
        >
          {isPending ? "Processing..." : "Confirm Booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal;
