import React, { useState, useEffect, useMemo } from "react";
import { 
  useEquipmentList, 
  useFindEquipment,
  useUseEquipment,
  useFinishUsingEquipment,
  useEquipmentFilters
} from "@/hooks/use-equipment";
import EquipmentCard from "./equipment-card";
import { 
  Typography, 
  Box, 
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
  SelectChangeEvent,
  Checkbox,
  ListItemText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { Button } from "@mui/material";
import type { Equipment } from "@/lib/api";

interface EquipmentListProps {
  onBookEquipment: (equipmentId: string) => void;
}

const ITEMS_PER_PAGE = 38;

const EquipmentList: React.FC<EquipmentListProps> = ({ onBookEquipment }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Получаем фильтры с внешнего API
  const { data: externalFilters, isLoading: isLoadingFilters } = useEquipmentFilters();
  
  // Fetch equipment data
  const { data: allEquipment, isLoading: isLoadingAll } = useEquipmentList();
  // Используем новый API метод поиска с параметром q и фильтрами
  const { data: searchResults, isLoading: isLoadingSearch } = useFindEquipment(
    debouncedSearchTerm,
    // Передаем только активные фильтры (с непустыми значениями)
    Object.entries(selectedFilters)
      .filter(([_, values]) => values && values.length > 0)
      .reduce((acc, [key, values]) => ({ ...acc, [key]: values }), {})
  );
  
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

  // Determine which data to display
  const displayData = useMemo(() => {
    // Проверяем, есть ли активные фильтры или поисковый запрос
    const hasActiveFilters = Object.values(selectedFilters).some(values => values && values.length > 0);
    
    // Если активны фильтры или поиск - используем данные из поиска
    if (debouncedSearchTerm || hasActiveFilters) {
      return searchResults || [];
    }
    
    // Иначе показываем все оборудование
    return allEquipment || [];
  }, [debouncedSearchTerm, selectedFilters, searchResults, allEquipment]);

  // Calculate pagination
  const totalPages = Math.ceil((displayData && Array.isArray(displayData) ? displayData.length : 0) / ITEMS_PER_PAGE);
  
  // Для отладки
  useEffect(() => {
    console.log("Данные оборудования:", displayData);
    console.log("Общее количество оборудования:", displayData?.length || 0);
    console.log("Текущая страница:", currentPage);
    console.log("Всего страниц:", totalPages);
  }, [displayData, currentPage, totalPages]);
  
  const paginatedData = useMemo(() => {
    if (!displayData || !Array.isArray(displayData)) return [];
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const result = displayData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    console.log("Данные на текущей странице:", result.length);
    return result;
  }, [displayData, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedFilters]);
  
  // Проверяем текущий статус загрузки и делаем его максимально коротким
  const [isLoading, setIsLoading] = useState(false);
  
  // Отслеживаем реальное состояние загрузки
  useEffect(() => {
    const loadingState = isLoadingAll || isLoadingSearch || isLoadingFilters;
    
    if (loadingState) {
      setIsLoading(true);
      // Устанавливаем очень короткий таймаут для отмены состояния загрузки
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // Всего 800мс максимум показывается спиннер
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isLoadingAll, isLoadingSearch, isLoadingFilters]);
  
  // Базовая проверка на ошибки 
  const hasError = !displayData || !Array.isArray(displayData);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  
  // Обработчик изменения динамических фильтров
  const handleFilterChange = (filterName: string, event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: typeof value === 'string' ? [value] : value
    }));
  };
  
  // Обработчик сброса конкретного фильтра
  const handleClearFilter = (filterName: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: []
    }));
  };
  
  // Обработчик сброса всех фильтров
  const handleClearAllFilters = () => {
    setSelectedFilters({});
    setSearchTerm("");
  };
  
  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = useMemo(() => {
    return Object.values(selectedFilters).some(values => values && values.length > 0) || !!searchTerm;
  }, [selectedFilters, searchTerm]);
  
  // Обработчик для кнопок "Использовать" и "Завершить"
  const handleEquipmentAction = (equipmentId: string) => {
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
    <Box mb={4} sx={{ backgroundColor: '#ffffff' }}>
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
            width: { xs: '80%', md: '33.333%' },
            '& .MuiOutlinedInput-root': {
              borderColor: searchTerm ? 'primary.main' : undefined,
              bgcolor: searchTerm ? 'rgba(63, 81, 181, 0.05)' : undefined,
              '& fieldset': {
                borderColor: searchTerm ? 'primary.main' : undefined,
                borderWidth: searchTerm ? 2 : 1
              },
              '&:hover fieldset': {
                borderColor: searchTerm ? 'primary.main' : undefined,
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <Box 
                  sx={{ 
                    cursor: 'pointer',
                    display: 'flex',
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                  onClick={() => setSearchTerm('')}
                >
                  <ClearIcon fontSize="small" />
                </Box>
              </InputAdornment>
            ) : null,
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
              width: { xs: '100%', sm: 170 },
              flexShrink: 0,
              position: 'relative'
            }} 
            size="small"
          >
            <InputLabel
              sx={{
                color: (selectedFilters[filter.name]?.length || 0) > 0 ? 'primary.main' : undefined,
                fontWeight: (selectedFilters[filter.name]?.length || 0) > 0 ? 'bold' : undefined
              }}
            >
              {filter.label}
            </InputLabel>
            {/* Кнопка сброса фильтра */}
            {(selectedFilters[filter.name]?.length || 0) > 0 && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  right: -8, 
                  top: -8, 
                  zIndex: 1, 
                  cursor: 'pointer',
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFilter(filter.name);
                }}
              >
                <ClearIcon sx={{ fontSize: 12 }} />
              </Box>
            )}
            <MuiSelect
              multiple
              value={selectedFilters[filter.name] || []}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.name, e)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: (selectedFilters[filter.name]?.length || 0) > 0 ? 'primary.main' : undefined,
                  borderWidth: (selectedFilters[filter.name]?.length || 0) > 0 ? 2 : 1
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: (selectedFilters[filter.name]?.length || 0) > 0 ? 'primary.main' : undefined,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                bgcolor: (selectedFilters[filter.name]?.length || 0) > 0 ? 'rgba(63, 81, 181, 0.05)' : undefined,
                '& .MuiSelect-select': {
                  fontWeight: (selectedFilters[filter.name]?.length || 0) > 0 ? 'bold' : 'normal',
                }
              }}
              renderValue={(selected) => {
                const selectedArray = selected as string[];
                if (selectedArray.length === 0) {
                  return `Все ${filter.label.toLowerCase()}`;
                }
                
                // Если есть выбранные фильтры, отображаем с выделением
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.main',
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mr: 1
                      }}
                    >
                      {selectedArray.length > 1 
                        ? `Выбрано: ${selectedArray.length}` 
                        : selectedArray[0]}
                    </Typography>
                    {selectedArray.length > 1 && (
                      <Box 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          borderRadius: '50%',
                          width: 22, 
                          height: 22,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedArray.length}
                      </Box>
                    )}
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              {filter.options.map((option) => {
                const isChecked = (selectedFilters[filter.name] || []).indexOf(option) > -1;
                return (
                  <MenuItem 
                    key={option} 
                    value={option}
                    sx={{
                      bgcolor: isChecked ? 'rgba(63, 81, 181, 0.1)' : undefined,
                      '&:hover': {
                        bgcolor: isChecked ? 'rgba(63, 81, 181, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <Checkbox 
                      checked={isChecked} 
                      sx={{
                        color: isChecked ? 'primary.main' : undefined,
                      }}
                    />
                    <ListItemText 
                      primary={option}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: isChecked ? 'bold' : 'normal',
                          color: isChecked ? 'primary.main' : undefined,
                        }
                      }}
                    />
                  </MenuItem>
                );
              })}
            </MuiSelect>
          </FormControl>
        ))}
      </Box>
      
      {/* Кнопка сброса всех фильтров */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FilterAltOffIcon />}
            onClick={handleClearAllFilters}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: 'rgba(63, 81, 181, 0.1)',
              }
            }}
          >
            Сбросить все фильтры
          </Button>
        </Box>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (!displayData || !Array.isArray(displayData) || displayData.length === 0) ? (
        <Paper sx={{ py: 4, textAlign: 'center', mb: 4, backgroundColor: '#ffffff' }} elevation={1}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения. Попробуйте изменить параметры поиска или фильтры.
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