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
  
  // Создаем заглушки для внешнего оборудования вместо реального API
  const mockEquipment: IEquipmentItem[] = [
    {
      id: 1001,
      name: 'Аналитические весы OHAUS',
      description: 'Высокоточные весы с точностью измерения до 0.0001 г',
      category: 'Измерительное оборудование',
      location: 'Лаборатория химического анализа',
      status: 'available',
      usageType: 'immediate',
      isFavorite: false
    },
    {
      id: 1002,
      name: 'Лабораторные весы Sartorius',
      description: 'Электронные весы с максимальной нагрузкой до 3000 г',
      category: 'Измерительное оборудование',
      location: 'Центральная лаборатория',
      status: 'available',
      usageType: 'booking',
      isFavorite: true
    },
    {
      id: 1003,
      name: 'Прецизионные весы AND',
      description: 'Весы для точных измерений с защитой от вибраций',
      category: 'Измерительное оборудование',
      location: 'Аналитический центр',
      status: 'available',
      usageType: 'booking',
      isFavorite: false
    },
    {
      id: 1004,
      name: 'Микровесы Mettler Toledo',
      description: 'Сверхточные весы для микрообъемов, с разрешением до 0.000001 г',
      category: 'Измерительное оборудование',
      location: 'Микробиологическая лаборатория',
      status: 'available',
      usageType: 'booking',
      isFavorite: false
    }
  ];
  
  // Фильтруем оборудование в соответствии с поисковым запросом
  const filteredEquipment = searchTerm.toLowerCase() === 'весы' 
    ? mockEquipment 
    : mockEquipment.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
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