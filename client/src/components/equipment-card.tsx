import React, { memo, useMemo, useCallback } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  styled
} from "@mui/material";
import { useLocation } from "wouter";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import type { Equipment } from "@/lib/optimized-api";
import { useFavorites } from '@/hooks/use-favorites';

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: (equipmentId: string) => void;
}

// Стилизованная карточка с фиксированной шириной и отключенными анимациями
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  width: '15vw',
  minWidth: '250px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  transition: 'none', // Отключаем все анимации для повышения производительности
  [theme.breakpoints.down(900)]: {
    width: '42vw',
    minWidth: '120px',
  }
}));

// Стилизованная область контента с авто-растягиванием
const ContentArea = styled(Box)({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column'
});

// Константные стили вынесены за пределы компонента для предотвращения пересоздания
const statusChipStyle = {
  position: 'absolute' as const, 
  top: 12, 
  left: '50%',
  transform: 'translateX(-50%)',
  fontWeight: 'medium',
  zIndex: 1,
  px: 2,
  py: 0.8
};

// Предопределенная карта конфигураций для разных статусов
const statusConfigs = {
  available: null,
  booked: { label: "Забронировано", color: "error" as const },
  maintenance: { label: "На обслуживании", color: "warning" as const },
  in_use: { label: "В работе", color: "primary" as const },
  repair: { label: "В ремонте", color: "error" as const },
};

// Оптимизированный мемоизированный чип статуса
const StatusChip = memo(({ status }: { status: string }) => {
  // Если статус available или неизвестный, не показываем чип
  if (status === 'available' || !statusConfigs[status as keyof typeof statusConfigs]) {
    return null;
  }
  
  // Получаем предопределенную конфигурацию
  const config = statusConfigs[status as keyof typeof statusConfigs];
  
  // Если нет конфигурации, не рендерим ничего
  if (!config) return null;
  
  // Возвращаем чип с предопределенной конфигурацией
  return (
    <Chip 
      label={config.label}
      color={config.color}
      size="small"
      sx={statusChipStyle}
    />
  );
});

// Основной компонент карточки
const EquipmentCard = ({ equipment, onBook }: EquipmentCardProps) => {
  const [, setLocation] = useLocation();
  
  // Используем хук для работы с избранным
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Мемоизация проверки избранного для предотвращения лишних перерисовок
  const isEquipmentFavorite = useMemo(() => isFavorite(equipment.id), [isFavorite, equipment.id]);
  
  // Переход на страницу деталей оборудования - мемоизируем функцию
  const handleCardClick = useCallback(() => {
    setLocation(`/equipment/${equipment.id}`);
  }, [setLocation, equipment.id]);
  
  // Мемоизируем функцию обработки клика по кнопке избранного
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(equipment.id);
  }, [toggleFavorite, equipment.id]);
  
  // Мемоизируем конфигурацию кнопки для предотвращения перерисовок
  const buttonConfig = useMemo(() => {
    // Функция обработки клика кнопки
    const handleButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onBook(equipment.id);
    };
    
    // Определяем конфигурацию кнопки в зависимости от типа оборудования и его статуса
    if (equipment.usageType === 'immediate_use') {
      // Для оборудования мгновенного использования
      if (equipment.status === 'in_use') {
        return {
          variant: "contained" as const,
          color: "warning" as const,
          disabled: false,
          label: "Завершить",
          onClick: handleButtonClick
        };
      } else if (equipment.status === 'available') {
        return {
          variant: "contained" as const,
          color: "success" as const,
          disabled: false,
          label: "Использовать",
          onClick: handleButtonClick
        };
      }
    } else if (equipment.usageType === 'booking_required') {
      // Для оборудования, требующего бронирования
      return {
        variant: "contained" as const,
        color: "primary" as const,
        disabled: equipment.status !== 'available',
        label: "Забронировать",
        onClick: handleButtonClick
      };
    } else if (equipment.usageType === 'long_term') {
      // Для оборудования длительного использования
      return {
        variant: "contained" as const,
        color: "primary" as const,
        disabled: equipment.status !== 'available',
        label: "Забронировать",
        onClick: handleButtonClick
      };
    }
    
    // По умолчанию кнопка "Забронировать"
    return {
      variant: "contained" as const,
      color: "primary" as const,
      disabled: equipment.status !== 'available',
      label: "Забронировать",
      onClick: handleButtonClick
    };
  }, [equipment.usageType, equipment.status, equipment.id, onBook]);

  // Мемоизируем кнопку избранного для предотвращения ререндеров
  const favoriteButton = useMemo(() => (
    <Button
      variant="text"
      sx={{
        position: 'absolute',
        top: 5,
        right: 5,
        minWidth: 'auto',
        padding: '5px',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 10,
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.9)',
        }
      }}
      onClick={handleFavoriteClick}
    >
      {isEquipmentFavorite ? 
        <StarIcon color="error" fontSize="small" /> : 
        <StarBorderIcon fontSize="small" />
      }
    </Button>
  ), [isEquipmentFavorite, handleFavoriteClick]);

  return (
    <StyledCard>
      {favoriteButton}
      
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
        <StatusChip status={equipment.status} />
      
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

// Оборачиваем в memo для предотвращения лишних рендеров
export default memo(EquipmentCard);