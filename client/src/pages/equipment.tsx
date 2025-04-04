import React, { useState } from "react";
import { useLocation } from "wouter";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EquipmentList from "@/components/equipment-list";
import BookingModal from "@/components/booking-modal";
import ConfirmationModal from "@/components/confirmation-modal";
import { useEquipmentList } from "@/hooks/use-equipment";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Equipment, Booking } from "@/lib/api";

interface EquipmentPageProps {
  onNavigateToBookings?: () => void;
  showFavorites?: boolean;
}

const EquipmentPage: React.FC<EquipmentPageProps> = ({ onNavigateToBookings, showFavorites = false }) => {
  const [, navigate] = useLocation();
  const { data: equipmentList } = useEquipmentList();
  const isMobile = useIsMobile();
  
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
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
  const handleBookEquipment = (equipmentId: string) => {
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
          additionalRequirements: null,
          createdAt: new Date()
        },
        equipment: selectedEquipment
      });
    }
    
    setIsConfirmationModalOpen(true);
  };
  
  // Перейти на страницу добавления оборудования
  const handleAddEquipment = () => {
    navigate("/equipment/add");
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {showFavorites ? "Избранное оборудование" : "Доступное оборудование"}
        </Typography>
        {!isMobile && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddEquipment}
          >
            Добавить оборудование
          </Button>
        )}
      </Box>
      
      <EquipmentList 
        onBookEquipment={handleBookEquipment} 
        initialShowFavorites={showFavorites} 
        hideFilters={showFavorites} 
      />
      
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
