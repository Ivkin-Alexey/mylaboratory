import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip,
  TextField,
  Grid,
  CardActions,
  CircularProgress,
  Container
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { IEquipmentItem } from '@/models/equipments';
import { useFavoriteEquipment } from '@/hooks/use-external-api';

interface ExternalEquipmentListProps {
  equipmentList: IEquipmentItem[];
  isLoading: boolean;
  onSearch: (searchTerm: string) => void;
}

const ExternalEquipmentList: React.FC<ExternalEquipmentListProps> = ({ 
  equipmentList, 
  isLoading, 
  onSearch 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    toggleFavorite, 
    isLoading: isFavoriteLoading 
  } = useFavoriteEquipment();

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleToggleFavorite = (equipmentId: number, isFavorite: boolean | undefined) => {
    toggleFavorite(equipmentId, isFavorite);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Поиск оборудования"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button 
          variant="contained" 
          onClick={handleSearch}
          sx={{ minWidth: '120px' }}
        >
          Поиск
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : equipmentList.length === 0 ? (
        <Typography>Оборудование не найдено.</Typography>
      ) : (
        <Container maxWidth="lg" disableGutters>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1 }}>
            {equipmentList.map((equipment) => (
              <Box key={equipment.id} sx={{ p: 1, width: { xs: '100%', sm: '50%', md: '25%' } }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 250, mx: 'auto' }}>
                  {equipment.imageUrl ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={equipment.imageUrl}
                      alt={equipment.name}
                    />
                  ) : (
                    <Box sx={{ height: 140, bgcolor: 'grey.300', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="textSecondary">Изображение недоступно</Typography>
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {equipment.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {equipment.description}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={equipment.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ px: 1 }}
                      />
                      {equipment.status && equipment.status !== 'available' && (
                        <Chip 
                          label={equipment.status === 'booked' ? 'Забронировано' : 
                                equipment.status === 'maintenance' ? 'На обслуживании' : 
                                equipment.status === 'in_use' ? 'Используется' : equipment.status} 
                          size="small" 
                          color={equipment.status === 'booked' ? 'warning' : 
                                equipment.status === 'maintenance' ? 'error' : 
                                equipment.status === 'in_use' ? 'info' : 'default'}
                          sx={{ px: 1 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={equipment.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                      onClick={() => handleToggleFavorite(equipment.id, equipment.isFavorite)}
                      disabled={isFavoriteLoading}
                    >
                      {equipment.isFavorite ? 'В избранном' : 'В избранное'}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default ExternalEquipmentList;