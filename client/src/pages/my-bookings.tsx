import React, { useState } from "react";
import { useUserBookings } from "@/hooks/use-bookings";
import { 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  SelectChangeEvent
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CancelBookingModal from "@/components/cancel-booking-modal";
import type { BookingWithEquipment } from "@shared/schema";

interface MyBookingsProps {
  onNavigateToEquipment?: () => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ onNavigateToEquipment }) => {
  const { data: bookings, isLoading } = useUserBookings();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookingToCancel, setBookingToCancel] = useState<BookingWithEquipment | null>(null);
  
  // Filter bookings by status
  const filteredBookings = bookings?.filter(booking => 
    statusFilter === "all" || booking.status === statusFilter
  );
  
  // Handle cancel booking
  const handleCancelBooking = (booking: BookingWithEquipment) => {
    setBookingToCancel(booking);
  };
  
  // Handle rebooking
  const handleRebook = (equipmentId: number) => {
    console.log("Rebooking equipment:", equipmentId);
    if (onNavigateToEquipment) {
      onNavigateToEquipment();
    }
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  // Get status chip based on booking status
  const getStatusChip = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Chip label="Confirmed" color="success" size="small" />;
      case "pending":
        return <Chip label="Pending" color="warning" size="small" />;
      case "completed":
        return <Chip label="Completed" color="default" size="small" />;
      case "cancelled":
        return <Chip label="Cancelled" color="error" size="small" />;
      default:
        return null;
    }
  };
  
  // Format time slot for display
  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot.replace('-', ' - ').replace(':', ':').replace(':', ':');
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          My Bookings
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Filter by Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Filter by Status"
          >
            <MenuItem value="all">All Bookings</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !filteredBookings || filteredBookings.length === 0 ? (
        <Card elevation={1} sx={{ textAlign: 'center', py: 4, mb: 4 }}>
          <CardContent>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.primary" gutterBottom>
              No bookings found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't booked any equipment yet. Book equipment to see it listed here.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={onNavigateToEquipment}
            >
              Browse Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ mb: 4 }}>
          <Table aria-label="bookings table">
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={booking.equipment.imageUrl || "https://via.placeholder.com/150?text=No+Image"}
                        alt={booking.equipment.name}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {booking.equipment.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.equipment.location}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{booking.date}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatTimeSlot(booking.timeSlot)}</Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(booking.status)}
                  </TableCell>
                  <TableCell>
                    {booking.status === "confirmed" || booking.status === "pending" ? (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => handleCancelBooking(booking)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        variant="text"
                        color="primary"
                        size="small"
                        onClick={() => handleRebook(booking.equipmentId)}
                      >
                        Book Again
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <CancelBookingModal
        isOpen={!!bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        booking={bookingToCancel}
      />
    </Box>
  );
};

export default MyBookings;
