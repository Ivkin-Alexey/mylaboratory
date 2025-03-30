import React, { useState } from "react";
import { useUserBookings } from "@/hooks/use-bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
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
  
  // Get status badge based on booking status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case "completed":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  // Format time slot for display
  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot.replace('-', ' - ').replace(':', ':').replace(':', ':');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
        <div className="flex space-x-4">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Bookings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !filteredBookings || filteredBookings.length === 0 ? (
        <Card className="bg-white shadow rounded-lg py-8 text-center mb-8">
          <CardContent className="pt-6">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't booked any equipment yet. Book equipment to see it listed here.
            </p>
            <div className="mt-6">
              <Button onClick={onNavigateToEquipment}>
                Browse Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={booking.equipment.imageUrl || "https://via.placeholder.com/150?text=No+Image"}
                            alt={booking.equipment.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booking.equipment.name}</div>
                          <div className="text-sm text-gray-500">{booking.equipment.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{booking.date}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{formatTimeSlot(booking.timeSlot)}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell>
                      {booking.status === "confirmed" || booking.status === "pending" ? (
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:text-red-800 font-medium"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="text-primary hover:text-primary/80 font-medium"
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
          </div>
        </div>
      )}
      
      <CancelBookingModal
        isOpen={!!bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        booking={bookingToCancel}
      />
    </div>
  );
};

export default MyBookings;
