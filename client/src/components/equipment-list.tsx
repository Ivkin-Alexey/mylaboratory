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

const ITEMS_PER_PAGE = 6;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary">
          Available Equipment
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search equipment..."
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
            <InputLabel id="category-select-label">Category</InputLabel>
            <MuiSelect
              labelId="category-select-label"
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="microscopes">Microscopes</MenuItem>
              <MenuItem value="analyzers">Analyzers</MenuItem>
              <MenuItem value="spectrometers">Spectrometers</MenuItem>
              <MenuItem value="centrifuges">Centrifuges</MenuItem>
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
            No equipment found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter to find what you're looking for.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Equipment Grid */}
          <Grid container spacing={3}>
            {paginatedData?.map((item: Equipment) => (
              <Grid key={item.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, padding: 1 }}>
                <EquipmentCard 
                  equipment={item} 
                  onBook={onBookEquipment} 
                />
              </Grid>
            ))}
          </Grid>

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
