import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  styled
} from "@mui/material";
import type { Equipment } from "@shared/schema";

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: (equipmentId: number) => void;
}

// Стилизованная карточка с эффектом при наведении
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8]
  }
}));

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onBook }) => {
  // Определяем цвет и текст метки статуса
  const getStatusChip = () => {
    switch (equipment.status) {
      case "available":
        return (
          <Chip 
            label="Available" 
            color="success" 
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 12, 
              right: 12,
              fontWeight: 'medium'
            }}
          />
        );
      case "booked":
        return (
          <Chip 
            label="Booked" 
            color="error" 
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 12, 
              right: 12,
              fontWeight: 'medium'
            }}
          />
        );
      case "maintenance":
        return (
          <Chip 
            label="Maintenance" 
            color="warning" 
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 12, 
              right: 12,
              fontWeight: 'medium'
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StyledCard>
      <CardMedia
        component="img"
        height="180"
        image={equipment.imageUrl || "https://via.placeholder.com/400x250?text=No+Image"}
        alt={equipment.name}
      />
      {getStatusChip()}
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {equipment.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {equipment.description}
        </Typography>
        
        <Box sx={{ mt: 'auto', mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" component="span">
              Category:
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
              Location:
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
        
        {equipment.status === "available" ? (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => onBook(equipment.id)}
            fullWidth
          >
            Book Now
          </Button>
        ) : (
          <Button 
            variant="outlined"
            disabled
            fullWidth
          >
            {equipment.status === "maintenance" ? "Under Maintenance" : "Next Available: Soon"}
          </Button>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default EquipmentCard;
