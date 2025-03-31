import React, { useState } from "react";
import { useLocation } from "wouter";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EquipmentList from "@/components/equipment-list";
import BookingModal from "@/components/booking-modal";
import ConfirmationModal from "@/components/confirmation-modal";
import { useEquipmentList } from "@/hooks/use-equipment";
import { useExternalEquipmentList } from "@/hooks/use-external-api";
import ExternalEquipmentList from "@/components/external-equipment-list";
import { IEquipmentItem } from "@/models/equipments";
import type { Equipment, Booking } from "@shared/schema";

interface EquipmentPageProps {
  onNavigateToBookings?: () => void;
}

// Компонент для отображения внешнего оборудования из поиска по запросу "весы"
const ExternalEquipmentSection: React.FC = () => {
  const { data: equipmentList, isLoading, error } = useExternalEquipmentList('весы');
  
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Внешний каталог - Весы
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Результаты поиска по запросу "весы" из внешнего каталога:
      </Typography>
      
      {error && (
        <Box sx={{ p: 2, bgcolor: 'rgba(255, 235, 235, 0.5)', borderRadius: 1, mb: 2 }}>
          <Typography color="error" align="center" gutterBottom>
            <i>Ошибка при загрузке данных из внешнего API: {(error as Error).message}</i>
          </Typography>
        </Box>
      )}
      
      <ExternalEquipmentList 
        equipmentList={equipmentList || []} 
        isLoading={isLoading}
        onSearch={() => {}} // Пустая функция, поскольку поиск предустановлен
      />
    </Paper>
  );
};

const EquipmentPage: React.FC<EquipmentPageProps> = ({ onNavigateToBookings }) => {
  const [, navigate] = useLocation();
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
          Доступное оборудование
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddEquipment}
        >
          Добавить оборудование
        </Button>
      </Box>
      
      <EquipmentList onBookEquipment={handleBookEquipment} />
      
      {/* Добавляем раздел с внешним оборудованием */}
      <ExternalEquipmentSection />
      
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
