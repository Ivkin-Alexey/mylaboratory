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
import type { Equipment } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { getAvailableTimeSlots } from "@/lib/api";

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
  
  // Определим состояние для отслеживания запроса доступных слотов
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  
  // Fetch available time slots только когда дата выбрана
  const { data: availableSlots, isLoading: isLoadingSlots } = useAvailableTimeSlots(
    equipment?.id || null,
    date || null
  );
  
  // Когда запрос завершается, сбрасываем флаг loadingSlots
  useEffect(() => {
    if (!isLoadingSlots && loadingSlots) {
      setLoadingSlots(false);
    }
  }, [isLoadingSlots, loadingSlots]);
  
  // Create booking mutation
  const { mutate: createBooking, isPending } = useCreateBooking();
  
  // Reset form when modal opens with new equipment
  useEffect(() => {
    if (isOpen && equipment) {
      // Сбрасываем поля формы
      setDate("");
      setTimeSlot("");
      setPurpose("");
      setAdditionalRequirements("");
      
      // Предзагружаем слоты на сегодня и завтра для ускорения открытия модального окна
      const today = format(new Date(), "yyyy-MM-dd");
      const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");
      
      // Используем queryClient для предзагрузки
      queryClient.prefetchQuery({
        queryKey: ["available-slots", equipment.id, today],
        queryFn: () => getAvailableTimeSlots(equipment.id, today)
      });
      
      queryClient.prefetchQuery({
        queryKey: ["available-slots", equipment.id, tomorrow],
        queryFn: () => getAvailableTimeSlots(equipment.id, tomorrow)
      });
    }
  }, [isOpen, equipment]);
  
  // Form validation
  const isFormValid = date && timeSlot && purpose;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment || !isFormValid) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, заполните все обязательные поля.",
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
        Бронирование оборудования
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
                label="Дата бронирования"
                type="date" 
                value={date}
                onChange={(e) => {
                  // Изменение даты сбрасывает выбранный временной слот
                  if (e.target.value !== date) {
                    setTimeSlot("");
                    setDate(e.target.value);
                    setLoadingSlots(true);
                  }
                }}
                inputProps={{ min: minDate }}
                required
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth disabled={!date || isLoadingSlots}>
                <InputLabel id="time-slot-label">Временной интервал</InputLabel>
                <Select
                  labelId="time-slot-label"
                  id="time-slot"
                  value={timeSlot}
                  onChange={handleTimeSlotChange}
                  label="Временной интервал"
                >
                  {isLoadingSlots ? (
                    <MenuItem value="" disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Загрузка доступных интервалов...
                      </Box>
                    </MenuItem>
                  ) : availableSlots && Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    availableSlots.map((slot: string) => (
                      <MenuItem key={slot} value={slot}>
                        {slot.replace('-', ' - ').replace(':', ':').replace(':', ':')}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      Нет доступных интервалов на эту дату
                    </MenuItem>
                  )}
                </Select>
                {!date && <FormHelperText>Сначала выберите дату</FormHelperText>}
              </FormControl>
              
              <TextField
                fullWidth
                id="purpose"
                label="Цель использования"
                placeholder="Кратко опишите, для чего вам нужно это оборудование"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                multiline
                rows={3}
              />
              
              <TextField
                fullWidth
                id="additional-requirements"
                label="Дополнительные требования"
                placeholder="Любые особые требования или примечания"
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
          Отмена
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!isFormValid || isPending}
          color="primary"
        >
          {isPending ? "Обработка..." : "Подтвердить бронирование"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal;
