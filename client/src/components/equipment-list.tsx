import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { 
  useEquipmentList, 
  useFindEquipment,
  useUseEquipment,
  useFinishUsingEquipment,
  useEquipmentFilters,
  useFavoriteEquipment
} from "@/hooks/use-equipment";
import { useFavorites } from "@/hooks/use-favorites";
import { getFavoriteIdsFromStorage } from "@/hooks/use-favorites";
import EquipmentCard from "./equipment-card";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
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
import type { Equipment, ExternalFilter } from "@/lib/optimized-api";

// Оптимизированный мемоизированный компонент селекта
// Определим FilterSelectProps как интерфейс для пропсов компонента
interface FilterSelectProps {
  filter: ExternalFilter;
  value: string[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
}

// Оптимизированный компонент селекта
const OptimizedFilterSelect = memo(({ filter, value, onChange }: FilterSelectProps) => {
  const isActive = (value?.length || 0) > 0;
  
  // Компактная функция рендеринга значения
  const renderValue = (selected: unknown) => {
    const selectedArray = selected as string[];
    if (selectedArray.length === 0) {
      return `Все ${filter.label.toLowerCase()}`;
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography 
          component="span" 
          sx={{ 
            color: 'primary.main',
            fontWeight: 'bold'
          }}
        >
          {filter.label}:
        </Typography>
        {selectedArray.length > 2 ? (
          <Box sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            ml: 1,
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            px: 1,
            py: 0.2,
            color: 'primary.main',
            bgcolor: 'rgba(63, 81, 181, 0.1)'
          }}>
            {selectedArray.length}
          </Box>
        ) : null}
      </Box>
    );
  };
  
  // Базовые стили для селекта
  const selectStyles = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isActive ? 'primary.main' : undefined,
      borderWidth: isActive ? 2 : 1
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: isActive ? 'primary.main' : undefined,
    },
    bgcolor: isActive ? 'rgba(63, 81, 181, 0.05)' : undefined,
    '& .MuiSelect-select': {
      fontWeight: isActive ? 'bold' : 'normal',
    }
  };
  
  // Опции меню
  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 300
      }
    },
    transitionDuration: 0 as const, // Явно указываем тип
    disablePortal: true,
    disableScrollLock: true
  };
  
  // Рендерим только первые 200 опций для предотвращения зависаний
  const menuItems = useMemo(() => {
    return filter.options.slice(0, 200).map((option) => {
      const isChecked = (value || []).indexOf(option) > -1;
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
            disableRipple
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
    });
  }, [filter.options, value]);
  
  return (
    <MuiSelect
      multiple
      value={value || []}
      label={filter.label}
      onChange={onChange}
      sx={selectStyles}
      renderValue={renderValue}
      MenuProps={menuProps}
    >
      {menuItems}
    </MuiSelect>
  );
});

interface EquipmentListProps {
  onBookEquipment: (equipmentId: string) => void;
  initialShowFavorites?: boolean;
  hideFilters?: boolean;
}

const ITEMS_PER_PAGE = 38;

const EquipmentList: React.FC<EquipmentListProps> = ({ 
  onBookEquipment, 
  initialShowFavorites = false, 
  hideFilters = false 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(initialShowFavorites);
  
  // Используем хук избранного
  const { favoriteIds, hasFavorites } = useFavorites();

  // Получаем фильтры с внешнего API
  const { data: externalFilters, isLoading: isLoadingFilters } = useEquipmentFilters();
  
  // Загружаем избранное оборудование напрямую по API (только если нужно)
  const { data: favoriteEquipment, isLoading: isLoadingFavorites } = useFavoriteEquipment(
    showOnlyFavorites ? favoriteIds : []
  );
  
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
    // Если данные еще загружаются, вернем null, чтобы показать состояние загрузки
    if ((isLoadingAll || isLoadingSearch) && (!showOnlyFavorites || isLoadingFavorites)) {
      return null;
    }
    
    // Если режим "Только избранное" активен - используем данные из прямого API-запроса избранного
    if (showOnlyFavorites) {
      return favoriteEquipment || [];
    }
    
    // Проверяем, есть ли активные фильтры или поисковый запрос
    const hasActiveFilters = Object.values(selectedFilters).some(values => values && values.length > 0);
    
    // Сначала определяем базовый набор данных
    let baseData: Equipment[] = [];
    
    // Если активны фильтры или поиск - используем данные из поиска
    if (debouncedSearchTerm || hasActiveFilters) {
      baseData = searchResults || [];
    } else {
      // Иначе показываем все оборудование
      baseData = allEquipment || [];
    }
    
    return baseData;
  }, [
    debouncedSearchTerm, 
    selectedFilters, 
    searchResults, 
    allEquipment, 
    isLoadingAll, 
    isLoadingSearch, 
    showOnlyFavorites, 
    favoriteEquipment, 
    isLoadingFavorites
  ]);

  // Calculate pagination
  const totalPages = Math.ceil((displayData && Array.isArray(displayData) ? displayData.length : 0) / ITEMS_PER_PAGE);
  
  // Отключаем отладочные логи для увеличения производительности
  
  const paginatedData = useMemo(() => {
    if (!displayData || !Array.isArray(displayData)) return [];
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayData, currentPage]);

  // Reset pagination when filters change or режим избранного изменяется
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedFilters, showOnlyFavorites]);
  
  // Проверяем текущий статус загрузки и делаем его максимально коротким
  const [isLoading, setIsLoading] = useState(true); // Начинаем с состояния загрузки
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);
  
  // Отслеживаем реальное состояние загрузки
  useEffect(() => {
    // Определяем состояние загрузки в зависимости от активного режима
    const loadingState = showOnlyFavorites 
      ? isLoadingFavorites || isLoadingFilters 
      : isLoadingAll || isLoadingSearch || isLoadingFilters;
    
    if (loadingState) {
      setIsLoading(true);
      setShowNoDataMessage(false);
      
      // Устанавливаем очень короткий таймаут для отмены состояния загрузки
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // Всего 800мс максимум показывается спиннер
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      
      // Добавляем задержку перед отображением сообщения об отсутствии данных
      const noDataTimer = setTimeout(() => {
        setShowNoDataMessage(true);
      }, 300);
      
      return () => clearTimeout(noDataTimer);
    }
  }, [isLoadingAll, isLoadingSearch, isLoadingFilters, isLoadingFavorites, showOnlyFavorites]);
  
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
  
  // Обработчик сброса всех фильтров (без очистки поискового запроса)
  const handleClearAllFilters = () => {
    setSelectedFilters({});
    // Сбрасываем также фильтр избранного, если он был активен
    if (showOnlyFavorites) {
      setShowOnlyFavorites(false);
    }
    // Теперь поисковая фраза остается в инпуте
  };
  
  // Проверяем, есть ли активные фильтры (только фильтры, без учета поискового запроса)
  const hasActiveFilters = useMemo(() => {
    return Object.values(selectedFilters).some(values => values && values.length > 0);
  }, [selectedFilters]);
  
  // Обработчик для кнопок "Использовать" и "Завершить" - мемоизирован для предотвращения ререндеров
  const handleEquipmentAction = useCallback((equipmentId: string) => {
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
  }, [displayData, finishUsingEquipmentMutation, useEquipmentMutation, onBookEquipment]);

  return (
    <Box mb={4} sx={{ backgroundColor: '#ffffff' }}>
      {/* Поисковая строка - отображается только если hideFilters=false */}
      {!hideFilters && (
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
              width: { xs: '89vw', md: '33.333%' },
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
      )}
      
      {/* Фильтры в строку - динамические из внешнего API - отображаются только если hideFilters=false */}
      {!hideFilters && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: { xs: 0, sm: 2 },
          mb: 4,
          px: { xs: 0, sm: 4 },
          mx: { xs: 'auto', sm: 0 },
          maxWidth: { xs: '92vw', sm: 'none' }
        }}>
          
          {/* Динамические фильтры из API */}
          {externalFilters && externalFilters.map((filter) => (
            <FormControl 
              key={filter.name}
              sx={{ 
                width: { xs: '44vw', sm: 170 },
                flexShrink: 0,
                position: 'relative',
                mx: { xs: 0, sm: 0 }
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
              {/* Используем оптимизированный селект для улучшения производительности */}
              <OptimizedFilterSelect
                filter={filter}
                value={selectedFilters[filter.name] || []}
                onChange={(e) => handleFilterChange(filter.name, e)}
              />
            </FormControl>
          ))}
        </Box>
      )}
      
      {/* Кнопки фильтров и избранного - отображаются только если hideFilters=false */}
      {!hideFilters && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 2,
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          {/* Кнопка сброса всех фильтров */}
          {hasActiveFilters && (
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
          )}
          
          {/* Кнопка переключения режима "Только избранное" */}
          <Button
            variant={showOnlyFavorites ? "contained" : "outlined"}
            color="error"
            size="small"
            startIcon={showOnlyFavorites ? <StarIcon /> : <StarBorderIcon />}
            onClick={() => {
              setShowOnlyFavorites(prev => !prev);
            }}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              }
            }}
          >
            {showOnlyFavorites ? "Все оборудование" : "Только избранное"}
          </Button>
        </Box>
      )}

      {/* Loading State */}
      {isLoading || isLoadingAll || isLoadingSearch || isLoadingFavorites ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (!displayData || !Array.isArray(displayData) || displayData.length === 0) && showNoDataMessage ? (
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
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(auto-fit, minmax(250px, 1fr))',
                md: 'repeat(auto-fit, minmax(250px, 1fr))'
              },
              gap: { xs: 1, sm: 2 },
              width: '100%',
            }}
          >
            {paginatedData?.map((item: Equipment) => (
              <Box key={item.id} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: { xs: '42vw', md: '15vw' }, minWidth: { xs: '120px', md: '250px' } }}>
                  <EquipmentCard 
                    equipment={item} 
                    onBook={handleEquipmentAction} 
                  />
                </Box>
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

// Оборачиваем компонент в memo для оптимизации ререндеров
export default memo(EquipmentList);