import React, { useState } from "react";
import EquipmentList from "@/components/equipment-list";
import BookingModal from "@/components/booking-modal";
import ConfirmationModal from "@/components/confirmation-modal";
import { useEquipmentList } from "@/hooks/use-equipment";
import type { Equipment, Booking } from "@shared/schema";

interface EquipmentPageProps {
  onNavigateToBookings?: () => void;
}

const EquipmentPage: React.FC<EquipmentPageProps> = ({ onNavigateToBookings }) => {
  const { data: equipmentList } = useEquipmentList();
  
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    booking: Booking | null;
    equipment: Equipment | null;
  }>({
    booking: null,
    equipment: null
  });
  
  // Find the selected equipment from the list
  const selectedEquipment = selectedEquipmentId 
    ? equipmentList?.find(item => item.id === selectedEquipmentId) || null
    : null;
  
  // Handle opening the booking modal
  const handleBookEquipment = (equipmentId: number) => {
    setSelectedEquipmentId(equipmentId);
    setIsBookingModalOpen(true);
  };
  
  // Handle booking success
  const handleBookingSuccess = () => {
    // Save the confirmed booking details for the confirmation modal
    if (selectedEquipment) {
      setConfirmedBooking({
        // This is a mock booking as we don't have the actual booking data yet
        // In a real implementation, this would be the returned booking from the API
        booking: {
          id: Math.floor(Math.random() * 10000),
          equipmentId: selectedEquipment.id,
          userId: 1,
          date: new Date().toISOString().slice(0, 10),
          timeSlot: "9:00-11:00",
          purpose: "Research",
          status: "confirmed",
          createdAt: new Date()
        },
        equipment: selectedEquipment
      });
    }
    
    setIsConfirmationModalOpen(true);
  };

  return (
    <>
      <EquipmentList onBookEquipment={handleBookEquipment} />
      
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
        equipment={selectedEquipment}
      />
      
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onViewBookings={onNavigateToBookings || (() => {})}
        bookingDetails={confirmedBooking}
      />
    </>
  );
};

export default EquipmentPage;
