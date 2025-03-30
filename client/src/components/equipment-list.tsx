import React, { useState, useEffect, useMemo } from "react";
import { useEquipmentList, useFilteredEquipment, useSearchEquipment } from "@/hooks/use-equipment";
import EquipmentCard from "./equipment-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  const totalPages = Math.ceil((displayData?.length || 0) / ITEMS_PER_PAGE);
  
  const paginatedData = useMemo(() => {
    if (!displayData) return [];
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayData, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory]);

  const isLoading = isLoadingAll || isLoadingFiltered || isLoadingSearch;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Available Equipment</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="microscopes">Microscopes</SelectItem>
                <SelectItem value="analyzers">Analyzers</SelectItem>
                <SelectItem value="spectrometers">Spectrometers</SelectItem>
                <SelectItem value="centrifuges">Centrifuges</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : displayData?.length === 0 ? (
        <div className="bg-white shadow rounded-lg py-8 text-center mb-8">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No equipment found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      ) : (
        <>
          {/* Equipment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData?.map((item: Equipment) => (
              <EquipmentCard 
                key={item.id} 
                equipment={item} 
                onBook={onBookEquipment} 
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    
                    // Only show first, last, current, and pages around current
                    if (
                      pageNumber === 1 || 
                      pageNumber === totalPages || 
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Add ellipsis
                    if (pageNumber === 2 || pageNumber === totalPages - 1) {
                      return (
                        <PaginationItem key={`ellipsis-${pageNumber}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EquipmentList;
