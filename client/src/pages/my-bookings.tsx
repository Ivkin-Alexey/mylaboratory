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
import type { BookingWithEquipment } from "@/lib/api";

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
  const handleRebook = (equipmentId: string) => {
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
        return <Chip label="Подтверждено" color="success" size="small" />;
      case "pending":
        return <Chip label="Ожидает подтверждения" color="warning" size="small" />;
      case "completed":
        return <Chip label="Завершено" color="default" size="small" />;
      case "cancelled":
        return <Chip label="Отменено" color="error" size="small" />;
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
        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ fontSize: '1rem' }}>
          Мои бронирования
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Фильтр по статусу</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Фильтр по статусу"
          >
            <MenuItem value="all">Все бронирования</MenuItem>
            <MenuItem value="confirmed">Подтверждено</MenuItem>
            <MenuItem value="pending">Ожидает подтверждения</MenuItem>
            <MenuItem value="completed">Завершено</MenuItem>
            <MenuItem value="cancelled">Отменено</MenuItem>
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
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontSize: '1rem' }}>
              Бронирования не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Вы ещё не бронировали оборудование. Забронируйте оборудование, чтобы увидеть его здесь.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={onNavigateToEquipment}
            >
              Просмотр оборудования
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ mb: 4 }}>
          <Table aria-label="bookings table">
            <TableHead>
              <TableRow>
                <TableCell>Оборудование</TableCell>
                <TableCell>Дата бронирования</TableCell>
                <TableCell>Время</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
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
                        Отменить
                      </Button>
                    ) : (
                      <Button
                        variant="text"
                        color="primary"
                        size="small"
                        onClick={() => handleRebook(booking.equipmentId)}
                      >
                        Забронировать снова
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
