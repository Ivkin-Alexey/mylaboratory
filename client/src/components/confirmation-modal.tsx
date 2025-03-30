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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle align="center">
        Booking Confirmed
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            bgcolor: 'success.light', 
            color: 'success.main', 
            borderRadius: '50%', 
            width: 64, 
            height: 64, 
            mb: 2 
          }}>
            <CheckCircleIcon fontSize="large" />
          </Box>
          
          <DialogContentText align="center" sx={{ mb: 3 }}>
            Your booking for <b>{equipment.name}</b> has been confirmed for <b>{booking.date}</b> from <b>{formatTimeSlot(booking.timeSlot)}</b>.
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
              Booking Details:
            </Typography>
            
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      Booking ID: <span style={{ color: 'text.secondary' }}>BK-{booking.id}</span>
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
                      Equipment: <span style={{ color: 'text.secondary' }}>{equipment.name}</span>
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
                      Location: <span style={{ color: 'text.secondary' }}>{equipment.location}</span>
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
                      Date: <span style={{ color: 'text.secondary' }}>{booking.date}</span>
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
                      Time: <span style={{ color: 'text.secondary' }}>{formatTimeSlot(booking.timeSlot)}</span>
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
          sx={{ minWidth: 120 }}
        >
          Continue Browsing
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onViewBookings}
          sx={{ minWidth: 120 }}
        >
          View My Bookings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
