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
      <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, pt: { xs: 2, sm: 3 } }}>
        Бронирование оборудования
      </DialogTitle>
      
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ pt: 1 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={equipment.imageUrl || "https://via.placeholder.com/150?text=No+Image"}
                  alt={equipment.name}
                  sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}
                />
                <Box sx={{ ml: 2, overflow: 'hidden' }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    maxWidth: { xs: '190px', sm: '300px' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {equipment.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    maxWidth: { xs: '190px', sm: '300px' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {equipment.location}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
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
                sx={{ 
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    height: { xs: '1.3em', sm: '1.4em' }
                  }
                }}
              />
              
              <FormControl fullWidth disabled={!date || isLoadingSlots} sx={{
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& .MuiSelect-select': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  padding: { xs: '0.5rem 0.75rem', sm: '0.75rem 1rem' }
                },
                '& .MuiFormHelperText-root': {
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  margin: { xs: '0.2rem 0 0', sm: '0.3rem 0 0' }
                }
              }}>
                <InputLabel id="time-slot-label">Временной интервал</InputLabel>
                <Select
                  labelId="time-slot-label"
                  id="time-slot"
                  value={timeSlot}
                  onChange={handleTimeSlotChange}
                  label="Временной интервал"
                >
                  {isLoadingSlots ? (
                    <MenuItem value="" disabled sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Загрузка доступных интервалов...
                      </Box>
                    </MenuItem>
                  ) : availableSlots && Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    availableSlots.map((slot: string) => (
                      <MenuItem key={slot} value={slot} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {slot.replace('-', ' - ').replace(':', ':').replace(':', ':')}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                sx={{ 
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
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
                sx={{ 
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Box>
          </Box>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ p: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 1 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Отмена
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!isFormValid || isPending}
          color="primary"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            whiteSpace: { xs: 'nowrap', sm: 'normal' }
          }}
        >
          {isPending ? "Обработка..." : "Подтвердить бронирование"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal;
