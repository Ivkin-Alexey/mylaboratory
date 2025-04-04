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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import type { Booking, Equipment } from "@/lib/api";

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
    return timeSlot.replace('-', ' до ').replace(':', ':').replace(':', ':');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle align="center" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, pt: { xs: 2, sm: 3 } }}>
        Бронирование подтверждено
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            bgcolor: 'success.light', 
            color: 'success.main', 
            borderRadius: '50%', 
            width: { xs: 56, sm: 64 }, 
            height: { xs: 56, sm: 64 }, 
            mb: 2 
          }}>
            <CheckCircleIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} />
          </Box>
          
          <DialogContentText align="center" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Ваше бронирование <b>{equipment.name}</b> подтверждено на <b>{booking.date}</b> с <b>{formatTimeSlot(booking.timeSlot)}</b>.
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
                      Оборудование: <span style={{ color: 'text.secondary' }}>{equipment.name}</span>
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
                      Местоположение: <span style={{ color: 'text.secondary' }}>{equipment.location}</span>
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
          sx={{ 
            minWidth: { xs: '100%', sm: 120 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Продолжить просмотр
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onViewBookings}
          sx={{ 
            minWidth: { xs: '100%', sm: 120 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Мои бронирования
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
