import React, { useState, useEffect, useMemo } from "react";
import { useEquipmentList, useFilteredEquipment, useSearchEquipment } from "@/hooks/use-equipment";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Fetch equipment data
  const { data: allEquipment, isLoading: isLoadingAll } = useEquipmentList();
  const { data: filteredEquipment, isLoading: isLoadingFiltered } = useFilteredEquipment(selectedCategory);
  const { data: searchResults, isLoading: isLoadingSearch } = useSearchEquipment(debouncedSearchTerm);

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
    if (debouncedSearchTerm) {
      return searchResults;
    } else if (selectedCategory !== "all") {
      return filteredEquipment;
    } else {
      return allEquipment;
    }
  }, [debouncedSearchTerm, selectedCategory, searchResults, filteredEquipment, allEquipment]);

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
  }, [debouncedSearchTerm, selectedCategory]);

  const isLoading = isLoadingAll || isLoadingFiltered || isLoadingSearch;

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Box mb={4}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Поиск оборудования..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="category-select-label">Категория</InputLabel>
            <MuiSelect
              labelId="category-select-label"
              value={selectedCategory}
              label="Категория"
              onChange={handleCategoryChange}
            >
              <MenuItem value="all">Все категории</MenuItem>
              <MenuItem value="microscopes">Микроскопы</MenuItem>
              <MenuItem value="analyzers">Анализаторы</MenuItem>
              <MenuItem value="spectrometers">Спектрометры</MenuItem>
              <MenuItem value="centrifuges">Центрифуги</MenuItem>
            </MuiSelect>
          </FormControl>
        </Box>
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
                  onBook={onBookEquipment} 
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
