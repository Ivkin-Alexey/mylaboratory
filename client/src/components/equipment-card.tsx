import React from "react";
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
import type { Equipment } from "@shared/schema";

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: (equipmentId: number) => void;
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
  
  console.log(`Rendering equipment card ${equipment.id}: ${equipment.name}, status: ${equipment.status}`);
  
  // Переход на страницу деталей оборудования
  const handleCardClick = () => {
    setLocation(`/equipment/${equipment.id}`);
  };
  
  // Определяем цвет и текст метки статуса
  const getStatusChip = () => {
    switch (equipment.status) {
      case "available":
        return (
          <Chip 
            label="Доступно" 
            color="success" 
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 12, 
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'medium',
              zIndex: 1
            }}
          />
        );
      case "booked":
        return (
          <Chip 
            label="Забронировано" 
            color="error" 
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 12, 
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'medium',
              zIndex: 1
            }}
          />
        );
      case "maintenance":
        return (
          <Chip 
            label="На обслуживании" 
            color="warning" 
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 12, 
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'medium',
              zIndex: 1
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StyledCard>
      <ContentArea 
        onClick={handleCardClick}
        sx={{ cursor: 'pointer' }}
      >
          <CardMedia
            component="img"
            height="180"
            image={equipment.imageUrl || "https://via.placeholder.com/400x250?text=No+Image"}
            alt={equipment.name}
          />
          {getStatusChip()}
        
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              {equipment.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {equipment.description}
            </Typography>
            
            <Box sx={{ mt: 'auto', mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" component="span">
                  Категория:
                </Typography>
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ ml: 0.5, fontWeight: 'medium', textTransform: 'capitalize' }}
                >
                  {equipment.category}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" component="span">
                  Локация:
                </Typography>
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ ml: 0.5, fontWeight: 'medium' }}
                >
                  {equipment.location}
                </Typography>
              </Box>
            </Box>
          </CardContent>
      </ContentArea>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        {equipment.status === "available" ? (
          <Button 
            variant="contained" 
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onBook(equipment.id);
            }}
            fullWidth
          >
            Забронировать
          </Button>
        ) : (
          <Button 
            variant="outlined"
            disabled
            fullWidth
          >
            {equipment.status === "maintenance" ? "На техобслуживании" : "Скоро будет доступно"}
          </Button>
        )}
      </Box>
    </StyledCard>
  );
};

export default EquipmentCard;