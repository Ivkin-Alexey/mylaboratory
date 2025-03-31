import React, { useState, useEffect, useMemo } from "react";
import { 
  useEquipmentList, 
  useSearchEquipment, 
  useFindEquipment,
  useUseEquipment,
  useFinishUsingEquipment,
  useEquipmentFilters
} from "@/hooks/use-equipment";
import EquipmentCard from "./equipment-card";
import { 
  Typography, 
  Box, 
  Grid, 
  TextField,
  MenuItem,
  Select as MuiSelect,
  FormControl,
  InputLabel,
  InputAdornment,
  Pagination as MuiPagination,
  CircularProgress,
  Paper,
  FormHelperText,
  SelectChangeEvent
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { Equipment } from "@shared/schema";

interface EquipmentListProps {
  onBookEquipment: (equipmentId: number) => void;
}

const ITEMS_PER_PAGE = 8;

const EquipmentList: React.FC<EquipmentListProps> = ({ onBookEquipment }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  // Получаем фильтры с внешнего API
  const { data: externalFilters, isLoading: isLoadingFilters } = useEquipmentFilters();
  
  // Fetch equipment data
  const { data: allEquipment, isLoading: isLoadingAll } = useEquipmentList();
  // Используем новый API метод поиска с параметром q
  const { data: searchResults, isLoading: isLoadingSearch } = useFindEquipment(debouncedSearchTerm);
  
  // Мутации для управления статусом оборудования
  const useEquipmentMutation = useUseEquipment();
  const finishUsingEquipmentMutation = useFinishUsingEquipment();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Determine which data to display with filter support
  const displayData = useMemo(() => {
    // Начальные данные на основе поиска
    let result = debouncedSearchTerm ? searchResults : allEquipment;
    
    // Применяем дополнительные фильтры
    if (result && Array.isArray(result)) {
      // Если есть выбранные фильтры, применяем их
      const activeFilters = Object.entries(selectedFilters).filter(([_, value]) => value !== "all");
      
      if (activeFilters.length > 0) {
        result = result.filter(item => {
          // Проверяем, соответствует ли элемент всем выбранным фильтрам
          return activeFilters.every(([filterName, filterValue]) => {
            // @ts-ignore: динамический доступ к свойствам оборудования
            const itemValue = item[filterName];
            return itemValue && (itemValue === filterValue || itemValue.includes(filterValue));
          });
        });
      }
    }
    
    return result;
  }, [debouncedSearchTerm, selectedFilters, searchResults, allEquipment]);

  // Calculate pagination
  const totalPages = Math.ceil((displayData && Array.isArray(displayData) ? displayData.length : 0) / ITEMS_PER_PAGE);
  
  const paginatedData = useMemo(() => {
    if (!displayData || !Array.isArray(displayData)) return [];
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayData, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedFilters]);

  const isLoading = isLoadingAll || isLoadingSearch || isLoadingFilters;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  
  // Обработчик изменения динамических фильтров
  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Обработчик для кнопок "Использовать" и "Завершить"
  const handleEquipmentAction = (equipmentId: number) => {
    const equipment = displayData?.find(item => item.id === equipmentId);
    
    if (!equipment) return;
    
    if (equipment.status === 'in_use' && equipment.usageType === 'immediate_use') {
      // Если оборудование используется, завершаем использование
      finishUsingEquipmentMutation.mutate(equipmentId);
    } else if (equipment.status === 'available' && equipment.usageType === 'immediate_use') {
      // Если оборудование доступно и имеет тип немедленного использования, используем его
      useEquipmentMutation.mutate(equipmentId);
    } else {
      // В остальных случаях используем обычный обработчик для бронирования
      onBookEquipment(equipmentId);
    }
  };

  return (
    <Box mb={4}>
      {/* Поисковая строка */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%',
        mb: 3
      }}>
        <TextField
          placeholder="Поиск оборудования..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ 
            width: { xs: '80%', md: '33.333%' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Фильтры в строку - динамические из внешнего API */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        mb: 4,
        px: { xs: 2, sm: 4 }
      }}>

        
        {/* Динамические фильтры из API */}
        {externalFilters && externalFilters.map((filter) => (
          <FormControl 
            key={filter.name}
            sx={{ 
              minWidth: 140,
              flexGrow: { xs: 1, md: 0 }
            }} 
            size="small"
          >
            <InputLabel>{filter.label}</InputLabel>
            <MuiSelect
              value={selectedFilters[filter.name] || "all"}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            >
              <MenuItem value="all">{`Все ${filter.label.toLowerCase()}`}</MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        ))}
      </Box>

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (!displayData || !Array.isArray(displayData) || displayData.length === 0) ? (
        <Paper sx={{ py: 4, textAlign: 'center', mb: 4 }} elevation={1}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            Оборудование не найдено
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте изменить параметры поиска или фильтры, чтобы найти нужное оборудование.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Equipment Grid */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 2
            }}
          >
            {paginatedData?.map((item: Equipment) => (
              <Box key={item.id}>
                <EquipmentCard 
                  equipment={item} 
                  onBook={handleEquipmentAction} 
                />
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <MuiPagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary" 
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default EquipmentList;
