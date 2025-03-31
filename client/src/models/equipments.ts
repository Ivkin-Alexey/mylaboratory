export type equipmentId = number;

export interface ISearchArg {
  searchTerm?: string;
  login?: string;
  filters?: Record<string, string | string[]>;
}

export type TEquipmentFilters = Record<string, string[]>;

export interface IEquipmentItem {
  id: equipmentId;
  name: string;
  description: string;
  category: string;
  location: string;
  status: string;
  imageUrl?: string;
  usageType: string;
  isFavorite?: boolean;
}