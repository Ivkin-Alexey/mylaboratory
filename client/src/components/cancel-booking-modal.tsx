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
      <DialogTitle align="center" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, pt: { xs: 2, sm: 3 } }}>
        Отмена бронирования
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            bgcolor: 'error.light', 
            color: 'error.main', 
            borderRadius: '50%', 
            width: { xs: 56, sm: 64 }, 
            height: { xs: 56, sm: 64 }, 
            mb: 2 
          }}>
            <WarningIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} />
          </Box>
          
          <DialogContentText align="center" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Вы уверены, что хотите отменить бронирование <b>{booking.equipment.name}</b> на <b>{booking.date}</b>? Это действие нельзя отменить.
          </DialogContentText>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              width: '100%', 
              bgcolor: 'action.hover',
              mb: 2  
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
            >
              Детали бронирования:
            </Typography>
            
            <List dense disablePadding sx={{ 
              '& .MuiListItem-root': { py: { xs: 0.5, sm: 0.75 } }
            }}>
              <ListItem>
                <ListItemIcon sx={{ minWidth: { xs: 24, sm: 28 } }}>
                  <FiberManualRecordIcon sx={{ fontSize: { xs: 6, sm: 8 } }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Номер бронирования: <span style={{ color: 'text.secondary' }}>BK-{booking.id}</span>
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: { xs: 24, sm: 28 } }}>
                  <FiberManualRecordIcon sx={{ fontSize: { xs: 6, sm: 8 } }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      '& span': {
                        display: 'inline-block',
                        maxWidth: { xs: '190px', sm: '300px' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        verticalAlign: 'bottom'
                      }
                    }}>
                      Оборудование: <span style={{ color: 'text.secondary' }}>{booking.equipment.name}</span>
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: { xs: 24, sm: 28 } }}>
                  <FiberManualRecordIcon sx={{ fontSize: { xs: 6, sm: 8 } }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Дата: <span style={{ color: 'text.secondary' }}>{booking.date}</span>
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: { xs: 24, sm: 28 } }}>
                  <FiberManualRecordIcon sx={{ fontSize: { xs: 6, sm: 8 } }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Время: <span style={{ color: 'text.secondary' }}>{formatTimeSlot(booking.timeSlot)}</span>
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 }, 
        pb: { xs: 2.5, sm: 3 }, 
        justifyContent: 'center', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: { xs: 1, sm: 2 }
      }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isPending}
          sx={{ 
            minWidth: { xs: '100%', sm: 120 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Сохранить бронирование
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleCancel}
          disabled={isPending}
          sx={{ 
            minWidth: { xs: '100%', sm: 120 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {isPending ? "Отмена..." : "Отменить бронирование"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelBookingModal;
