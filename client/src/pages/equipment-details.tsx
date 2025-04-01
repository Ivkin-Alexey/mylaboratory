import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Chip, 
  Divider, 
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Breadcrumbs,
  Link,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { useEquipmentList, useUseEquipment, useFinishUsingEquipment, useEquipmentById } from "@/hooks/use-equipment";
import { useQuery } from "@tanstack/react-query";
import BookingModal from "@/components/booking-modal";
import ConfirmationModal from "@/components/confirmation-modal";
import type { Equipment } from "@/lib/api";
import type { Booking } from "@/lib/api";
import { queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

interface EquipmentDetailsProps {
  onNavigateToBookings?: () => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ onNavigateToBookings }) => {
  const [_, params] = useRoute("/equipment/:id");
  const [, setLocation] = useLocation();
  const equipmentId = params ? parseInt(params.id) : null;
  const { data: equipment, isLoading, isError } = useEquipmentById(equipmentId);
  const { toast } = useToast();
  
  // Для отладки
  useEffect(() => {
    if (equipment) {
      console.log("Загружены данные оборудования с ID", equipmentId, equipment);
    }
  }, [equipment, equipmentId]);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  
  // Состояние для модального окна длительного использования
  const [isLongTermModalOpen, setIsLongTermModalOpen] = useState(false);
  const [longTermPeriod, setLongTermPeriod] = useState("");
  const [longTermPurpose, setLongTermPurpose] = useState("");
  
  // Состояния для функции немедленного использования
  const [isEquipmentLoading, setIsEquipmentLoading] = useState(false);
  const [isInUse, setIsInUse] = useState(equipment?.status === "in_use");
  
  // Обновляем статус кнопки при изменении данных оборудования
  useEffect(() => {
    if (equipment) {
      setIsInUse(equipment.status === "in_use");
    }
  }, [equipment]);
  
  // Мутации для использования и завершения использования оборудования
  const useEquipmentMutation = useUseEquipment();
  const finishUsingEquipmentMutation = useFinishUsingEquipment();
  
  // Обработчик для использования оборудования без бронирования
  const handleUseEquipment = (id: number) => {
    if (isInUse || isEquipmentLoading) return;
    setIsEquipmentLoading(true);
    
    useEquipmentMutation.mutate(id, {
      onSuccess: () => {
        setIsInUse(true);
        setIsEquipmentLoading(false);
      },
      onError: () => {
        setIsEquipmentLoading(false);
      }
    });
  };
  
  // Обработчик для завершения использования оборудования
  const handleFinishUsingEquipment = (id: number) => {
    if (!isInUse || isEquipmentLoading) return;
    setIsEquipmentLoading(true);
    
    finishUsingEquipmentMutation.mutate(id, {
      onSuccess: () => {
        setIsInUse(false);
        setIsEquipmentLoading(false);
      },
      onError: () => {
        setIsEquipmentLoading(false);
      }
    });
  };
  
  const [confirmedBooking, setConfirmedBooking] = useState<{
    booking: Booking | null;
    equipment: Equipment | null;
  }>({
    booking: null,
    equipment: null
  });

  // Get status chip based on equipment status
  const getStatusChip = (status: string) => {
    // Общий стиль для чипов статуса
    const chipStyle = { 
      px: 2, 
      py: 0.8, 
      fontWeight: 'medium' 
    };
    
    switch (status) {
      case "available":
        return <Chip label="Доступно" color="success" size="small" sx={chipStyle} />;
      case "booked":
        return <Chip label="Забронировано" color="error" size="small" sx={chipStyle} />;
      case "maintenance":
        return <Chip label="На обслуживании" color="warning" size="small" sx={chipStyle} />;
      case "in_use":
        return <Chip label="В работе" color="primary" size="small" sx={chipStyle} />;
      default:
        return null;
    }
  };

  // Handle booking success
  const handleBookingSuccess = () => {
    // Save the confirmed booking details for the confirmation modal
    if (equipment) {
      setConfirmedBooking({
        // This is a mock booking as we don't have the actual booking data yet
        // In a real implementation, this would be the returned booking from the API
        booking: {
          id: Math.floor(Math.random() * 10000),
          equipmentId: equipment.id,
          userId: 1,
          date: new Date().toISOString().slice(0, 10),
          timeSlot: "9:00-11:00",
          purpose: "Research",
          additionalRequirements: null,
          status: "confirmed",
          createdAt: new Date()
        },
        equipment: equipment
      });
    }
    
    setIsConfirmationModalOpen(true);
  };
  
  // Обработчик отправки запроса на длительное использование
  const handleLongTermRequest = () => {
    // Здесь будет логика отправки запроса на длительное использование
    // В реальном приложении здесь будет API-запрос
    
    alert(`Запрос на длительное использование отправлен!\nОборудование: ${equipment?.name}\nПериод: ${longTermPeriod}\nЦель: ${longTermPurpose}`);
    
    // Закрываем модальное окно
    setIsLongTermModalOpen(false);
    
    // Сбрасываем форму
    setLongTermPeriod("");
    setLongTermPurpose("");
  };

  // Handle navigate back
  const handleNavigateBack = () => {
    setLocation("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Equipment not found
  if (!equipment) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Оборудование не найдено
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Запрашиваемое оборудование не существует или было удалено.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleNavigateBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Вернуться к списку оборудования
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs navigation */}
      <Box sx={{ py: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          color="primary" 
          sx={{ mr: 1 }}
          onClick={handleNavigateBack}
        >
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleNavigateBack();
            }}
            sx={{ textDecoration: 'none' }}
          >
            Оборудование
          </Link>
          <Typography color="text.primary">{equipment.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Left column - Equipment Image */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 40%' } }}>
          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: '15px 15px 0 15px' }}>
              <CardMedia
                component="img"
                height="280"
                image={equipment.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
                alt={equipment.name}
                sx={{ objectFit: 'contain' }}
              />
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h5" component="h1" fontWeight="bold">
                  {equipment.name}
                </Typography>
                {getStatusChip(equipment.status)}
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                {equipment.description}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Right column - Details and Booking */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 60%' } }}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Детали оборудования
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Классификация" 
                  secondary={equipment.classification || "Не указано"}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Подразделение" 
                  secondary={equipment.department || "Не указано"}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Тип оборудования" 
                  secondary={equipment.type || "Не указано"}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Вид оборудования" 
                  secondary={equipment.kind || "Не указано"}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Выполняемые измерения" 
                  secondary={equipment.measurements || "Не указано"}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider component="li" variant="inset" />
              <ListItem>
                <ListItemIcon>
                  <BookmarkIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Статус" 
                  secondary={equipment.status === "available" ? "Доступно" : 
                           equipment.status === "in_use" ? "В работе" : 
                           equipment.status === "booked" ? "Забронировано" : 
                           equipment.status === "maintenance" ? "На обслуживании" : "Неизвестно"}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 3 }}>
              {equipment.status === "available" ? (
                // В зависимости от типа использования отображаем разные кнопки
                (() => {
                  switch (equipment.usageType) {
                    // Для оборудования требующего бронирования
                    case 'booking_required':
                      return (
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => setIsBookingModalOpen(true)}
                          fullWidth
                          size="large"
                        >
                          Забронировать это оборудование
                        </Button>
                      );
                    
                    // Для оборудования доступного для немедленного использования
                    case 'immediate_use':
                      return (
                        <Button 
                          variant="contained" 
                          color={isInUse ? "primary" : "success"}
                          fullWidth
                          size="large"
                          onClick={() => handleUseEquipment(equipment.id)}
                          disabled={isInUse || isEquipmentLoading}
                          startIcon={isEquipmentLoading && <CircularProgress size={20} color="inherit" />}
                        >
                          {isInUse ? "В работе" : "Использовать"}
                        </Button>
                      );
                    
                    // Для оборудования длительного использования
                    case 'long_term':
                      return (
                        <Button 
                          variant="contained" 
                          color="secondary"
                          onClick={() => setIsLongTermModalOpen(true)}
                          fullWidth
                          size="large"
                          startIcon={<WatchLaterIcon />}
                        >
                          Запросить для длительного использования
                        </Button>
                      );
                    
                    // По умолчанию показываем стандартную кнопку бронирования
                    default:
                      return (
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => setIsBookingModalOpen(true)}
                          fullWidth
                          size="large"
                        >
                          Забронировать это оборудование
                        </Button>
                      );
                  }
                })()
              ) : equipment.status === "in_use" && equipment.usageType === 'immediate_use' ? (
                <Button 
                  variant="contained"
                  color="success"
                  onClick={() => handleFinishUsingEquipment(equipment.id)}
                  fullWidth
                  size="large"
                  disabled={isEquipmentLoading}
                  startIcon={isEquipmentLoading && <CircularProgress size={20} color="inherit" />}
                >
                  Завершить
                </Button>
              ) : (
                <Button 
                  variant="outlined"
                  disabled
                  fullWidth
                  size="large"
                >
                  {equipment.status === "maintenance" ? "На техобслуживании" : "Уже забронировано"}
                </Button>
              )}
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Техническая информация
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 2
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Марка:
                </Typography>
                <Typography variant="body1">
                  {equipment.brand || "Не указано"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Модель:
                </Typography>
                <Typography variant="body1">
                  {equipment.model || "Не указано"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Серийный номер:
                </Typography>
                <Typography variant="body1">
                  {equipment.serialNumber || "Не указано"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Инвентарный номер:
                </Typography>
                <Typography variant="body1">
                  {equipment.inventoryNumber || "Не указано"}
                </Typography>
              </Box>
            </Box>
            
            {equipment.filesUrl && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Документация по оборудованию:
                </Typography>
                <Button 
                  variant="outlined"
                  color="primary"
                  size="small"
                  href={equipment.filesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Открыть документацию
                </Button>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
          </Paper>
        </Box>
      </Box>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
        equipment={equipment}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onViewBookings={onNavigateToBookings || (() => {})}
        bookingDetails={confirmedBooking}
      />
      
      {/* Модальное окно для запроса на длительное использование */}
      <Dialog 
        open={isLongTermModalOpen} 
        onClose={() => setIsLongTermModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Запрос на длительное использование</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Заполните форму для запроса оборудования "{equipment?.name}" на длительный срок. После отправки запроса с вами свяжется администратор.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            id="period"
            label="Требуемый период использования"
            placeholder="Например: 2 недели, 1 месяц"
            type="text"
            fullWidth
            variant="outlined"
            value={longTermPeriod}
            onChange={(e) => setLongTermPeriod(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <TextField
            margin="dense"
            id="purpose"
            label="Цель использования"
            placeholder="Опишите для чего вам необходимо данное оборудование"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={longTermPurpose}
            onChange={(e) => setLongTermPurpose(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setIsLongTermModalOpen(false)}
            variant="outlined"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleLongTermRequest}
            variant="contained" 
            color="secondary"
            disabled={!longTermPeriod.trim() || !longTermPurpose.trim()}
          >
            Отправить запрос
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EquipmentDetails;