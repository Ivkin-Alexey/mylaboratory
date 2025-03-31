export type equipmentId = string;

export interface IEquipmentItem {
  id: equipmentId;
  category: string;
  description: string;
  name: string;
  brand: string;
  model: string;
  imgUrl: string;
  isFavorite?: boolean;
  isOperate?: boolean;
  login?: string;
  userId?: string;
  userName?: string;
  serialNumber: string;
  inventoryNumber: string;
  
  // Добавляем поля для совместимости с локальным оборудованием
  location?: string;
  status?: string;
  usageType?: string;
}

export interface IEquipmentFilter {
  label: string;
  name: string;
  options: string[];
}

export type TEquipmentFilters = IEquipmentFilter[];

export interface IEquipmentFilterState {
  [key: string]: string[];
}

export interface ISearchArg {
  login?: string;
  searchTerm: string;
  filters?: IEquipmentFilterState;
}

export interface IQueriesObject {
  [key: string]: string[] | string;
}

export type TEquipmentCard = IEquipmentItem & {
  isCardMode: boolean;
}

export interface IAvailableEquipments {
  inaccessible: string[] | [];
  available: string[] | [];
}