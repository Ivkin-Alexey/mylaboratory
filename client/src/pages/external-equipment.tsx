import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper } from '@mui/material';
import ExternalEquipmentList from '@/components/external-equipment-list';
import { useExternalEquipmentList } from '@/hooks/use-external-api';
import { DEFAULT_SEARCH_TERM } from '@/constants';
import { IEquipmentItem } from '@/models/equipments';

interface ExternalEquipmentPageProps {
  onNavigateToEquipment?: () => void;
}

const ExternalEquipmentPage: React.FC<ExternalEquipmentPageProps> = ({ onNavigateToEquipment }) => {
  // Начинаем с поиска весов по умолчанию
  const [searchTerm, setSearchTerm] = useState('весы');
  
  // Используем хук для получения данных из внешнего API
  const { data: equipmentList, isLoading, error } = useExternalEquipmentList(searchTerm);
  
  // Список оборудования для отображения
  const filteredEquipment = equipmentList || [];
  
  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Внешний каталог оборудования
        </Typography>
        <Typography variant="body1" paragraph>
          Здесь вы можете найти оборудование из внешнего каталога и добавить его в избранное.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        {error && (
          <Box sx={{ p: 2, bgcolor: 'rgba(255, 235, 235, 0.5)', borderRadius: 1, mb: 2 }}>
            <Typography color="error" align="center" gutterBottom>
              <i>Ошибка при загрузке данных из внешнего API: {(error as Error).message}</i>
            </Typography>
          </Box>
        )}
        
        <ExternalEquipmentList 
          equipmentList={filteredEquipment} 
          isLoading={isLoading}
          onSearch={handleSearch}
        />
      </Paper>
    </Box>
  );
};

export default ExternalEquipmentPage;