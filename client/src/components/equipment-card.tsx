import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  styled,
  IconButton,
  Tooltip
} from "@mui/material";
import { useLocation } from "wouter";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import type { Equipment } from "@/lib/api";
import { useFavorites } from '@/hooks/use-favorites';

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: (equipmentId: string) => void;
}

// Стилизованная карточка с фиксированной шириной
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '250px',
  width: '100%',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

// Стилизованная область контента с авто-растягиванием
const ContentArea = styled(Box)(({ theme }) => ({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column'
}));

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onBook }) => {
  const [, setLocation] = useLocation();
  
  // Используем хук для работы с избранным
  const { isFavorite, toggleFavorite } = useFavorites();
  const isEquipmentFavorite = isFavorite(equipment.id);
  
  console.log(`Rendering equipment card ${equipment.id}: ${equipment.name}, status: ${equipment.status}`);
  
  // Переход на страницу деталей оборудования
  const handleCardClick = () => {
    setLocation(`/equipment/${equipment.id}`);
  };
  
  // Обработчик клика по кнопке избранного
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    toggleFavorite(equipment.id);
  };
  
  // Определяем цвет и текст метки статуса
  const getStatusChip = () => {
    // Стиль для всех статусных чипов
    const chipStyle = {
      position: 'absolute', 
      top: 12, 
      left: '50%',
      transform: 'translateX(-50%)',
      fontWeight: 'medium',
      zIndex: 1,
      px: 2,
      py: 0.8
    };
    
    switch (equipment.status) {
      // Для статуса "available" не показываем бейдж
      case "available":
        return null;
      case "booked":
        return (
          <Chip 
            label="Забронировано" 
            color="error" 
            size="small"
            sx={chipStyle}
          />
        );
      case "maintenance":
        return (
          <Chip 
            label="На обслуживании" 
            color="warning" 
            size="small"
            sx={chipStyle}
          />
        );
      case "in_use":
        return (
          <Chip 
            label="В работе" 
            color="primary" 
            size="small"
            sx={chipStyle}
          />
        );
      default:
        return null;
    }
  };

  // Получаем информацию о типе кнопки и её поведении в зависимости от типа использования
  const getButtonConfig = () => {
    // Определяем конфигурацию кнопки в зависимости от типа оборудования и его статуса
    if (equipment.usageType === 'immediate_use') {
      // Для оборудования мгновенного использования
      if (equipment.status === 'in_use') {
        return {
          variant: "contained" as const,
          color: "warning" as const,
          disabled: false,
          label: "Завершить",
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onBook(equipment.id);
          }
        };
      } else if (equipment.status === 'available') {
        return {
          variant: "contained" as const,
          color: "success" as const,
          disabled: false,
          label: "Использовать",
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onBook(equipment.id);
          }
        };
      }
    } else if (equipment.usageType === 'booking_required') {
      // Для оборудования, требующего бронирования
      return {
        variant: "contained" as const,
        color: "primary" as const,
        disabled: equipment.status !== 'available',
        label: "Забронировать",
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onBook(equipment.id);
        }
      };
    } else if (equipment.usageType === 'long_term') {
      // Для оборудования длительного использования
      return {
        variant: "contained" as const,
        color: "primary" as const,
        disabled: equipment.status !== 'available',
        label: "Забронировать",
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onBook(equipment.id);
        }
      };
    }
    
    // По умолчанию кнопка "Забронировать"
    return {
      variant: "contained" as const,
      color: "primary" as const,
      disabled: equipment.status !== 'available',
      label: "Забронировать",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onBook(equipment.id);
      }
    };
  };
  
  const buttonConfig = getButtonConfig();

  return (
    <StyledCard>
      {/* Кнопка добавления в избранное */}
      <Tooltip title={isEquipmentFavorite ? "Убрать звезду" : "Отметить звездой"}>
        <IconButton 
          sx={{
            position: 'absolute',
            top: 5,
            right: 5,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
          onClick={handleFavoriteClick}
          size="small"
          color={isEquipmentFavorite ? "error" : "default"}
        >
          {isEquipmentFavorite ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
      </Tooltip>
      
      <ContentArea 
        onClick={handleCardClick}
        sx={{ cursor: 'pointer' }}
      >
          <Box sx={{ height: '170px', overflow: 'hidden', p: '10px 10px 0 10px' }}>
            <CardMedia
              component="img"
              sx={{ 
                height: '150px', 
                objectFit: 'contain',
                maxHeight: '150px'
              }}
              image={equipment.imageUrl || "https://via.placeholder.com/400x250?text=No+Image"}
              alt={equipment.name}
            />
          </Box>
          {getStatusChip()}
        
          <CardContent sx={{ pb: 0 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              gutterBottom
              sx={{ fontSize: '1rem' }}
            >
              {equipment.name}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 2, fontSize: '0.875rem' }}
            >
              {equipment.description}
            </Typography>
          </CardContent>
      </ContentArea>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        {buttonConfig && (
          <Button 
            variant={buttonConfig.variant}
            color={buttonConfig.color || "primary"}
            disabled={buttonConfig.disabled}
            onClick={buttonConfig.onClick}
            fullWidth
          >
            {buttonConfig.label}
          </Button>
        )}
      </Box>
    </StyledCard>
  );
};

export default EquipmentCard;