import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions, 
  DialogContentText,
  Button,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useCancelBooking } from "@/hooks/use-bookings";
import type { BookingWithEquipment } from "@/lib/api";

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
    return timeSlot.replace('-', ' до ').replace(':', ':').replace(':', ':');
  };
  
  const handleCancel = () => {
    cancelBooking(booking.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle align="center">
        Отмена бронирования
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            bgcolor: 'error.light', 
            color: 'error.main', 
            borderRadius: '50%', 
            width: 64, 
            height: 64, 
            mb: 2 
          }}>
            <WarningIcon fontSize="large" />
          </Box>
          
          <DialogContentText align="center" sx={{ mb: 3 }}>
            Вы уверены, что хотите отменить бронирование <b>{booking.equipment.name}</b> на <b>{booking.date}</b>? Это действие нельзя отменить.
          </DialogContentText>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              width: '100%', 
              bgcolor: 'action.hover',
              mb: 2  
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Детали бронирования:
            </Typography>
            
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      Номер бронирования: <span style={{ color: 'text.secondary' }}>BK-{booking.id}</span>
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      Оборудование: <span style={{ color: 'text.secondary' }}>{booking.equipment.name}</span>
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      Дата: <span style={{ color: 'text.secondary' }}>{booking.date}</span>
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      Время: <span style={{ color: 'text.secondary' }}>{formatTimeSlot(booking.timeSlot)}</span>
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isPending}
          sx={{ minWidth: 120 }}
        >
          Сохранить бронирование
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleCancel}
          disabled={isPending}
          sx={{ minWidth: 120 }}
        >
          {isPending ? "Отмена..." : "Отменить бронирование"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelBookingModal;
