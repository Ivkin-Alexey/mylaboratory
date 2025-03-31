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
  const { 
    data: equipmentListData, 
    isLoading: isEquipmentLoading 
  } = useExternalEquipmentList(searchTerm);
  
  // Убедимся, что у нас всегда есть массив оборудования
  const equipmentList: IEquipmentItem[] = equipmentListData || [];
  
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
        <ExternalEquipmentList 
          equipmentList={equipmentList} 
          isLoading={isEquipmentLoading}
          onSearch={handleSearch}
        />
      </Paper>
    </Box>
  );
};

export default ExternalEquipmentPage;