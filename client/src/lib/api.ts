import { encodeQueryParams } from "@/constants";

// Определение типов для клиентской части
export interface Booking {
  id: number;
  equipmentId: number;
  userId: number;
  date: string;
  timeSlot: string;
  purpose: string;
  additionalRequirements: string | null;
  status: string;
  createdAt: Date;
}

export interface BookingWithEquipment extends Booking {
  equipment: Equipment;
}

// User ID (mock user for demo, в реальном приложении это пришло бы из авторизации)
const CURRENT_USER_ID = 1;

// API URL
const EXTERNAL_API_BASE_URL = "https://scmp-bot-server.ru/api";
const PAGE_SIZE = 100; // Большой размер страницы для получения всех результатов

// Тип Equipment для внутреннего использования в клиенте
export interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  status: string;
  imageUrl: string;
  usageType: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  inventoryNumber?: string;
}

// Тип InsertBooking для бронирований
export interface InsertBooking {
  equipmentId: number;
  userId: number;
  date: string;
  timeSlot: string;
  purpose: string;
  additionalRequirements?: string | null;
}

// Функция для маппинга данных с внешнего API в формат нашего приложения
const mapExternalEquipmentToLocal = (item: any): Equipment => {
  return {
    id: Number(item.id.substring(0, 9)), // Берем первые символы id для преобразования в number
    name: item.name,
    description: item.description,
    category: item.classification ? item.classification.toLowerCase().split(' ')[0] : "other",
    location: item.department || "Не указано",
    status: "available", // По умолчанию все оборудование доступно
    imageUrl: item.imgUrl,
    usageType: "requires_booking", // По умолчанию требуется бронирование
    brand: item.brand,
    model: item.model,
    serialNumber: item.serialNumber,
    inventoryNumber: item.inventoryNumber,
  };
};

// Функция для прямого вызова внешнего API 
const fetchFromExternalApi = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка при запросе к внешнему API: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка при обращении к внешнему API:", error);
    throw error;
  }
};

// Интерфейс для фильтров с внешнего API
export interface ExternalFilter {
  name: string;
  label: string;
  options: string[];
}

// Функция для получения фильтров с внешнего API
export const getEquipmentFilters = async (): Promise<ExternalFilter[]> => {
  try {
    // Используем только внешний API
    const response = await fetchFromExternalApi(`${EXTERNAL_API_BASE_URL}/equipments/filters`);
    return response || [];
  } catch (error) {
    console.error("Ошибка при получении фильтров:", error);
    return [];
  }
};

// Equipment API
export const getEquipmentList = async (): Promise<Equipment[]> => {
  try {
    // Получаем данные с внешнего API (используем пустой поисковый запрос для получения всех данных)
    const response = await fetchFromExternalApi(`${EXTERNAL_API_BASE_URL}/equipments/search?term=&page=1&pageSize=${PAGE_SIZE}`);
    
    // Преобразуем данные в формат приложения
    if (response && response.results && Array.isArray(response.results)) {
      return response.results.map(mapExternalEquipmentToLocal);
    }
    
    return [];
  } catch (error) {
    console.error("Ошибка при получении списка оборудования:", error);
    return [];
  }
};

export const getEquipmentById = async (id: number): Promise<Equipment> => {
  try {
    // Получаем все оборудование и ищем нужный id
    const allEquipment = await getEquipmentList();
    const equipment = allEquipment.find(item => item.id === id);
    
    if (!equipment) {
      throw new Error(`Оборудование с ID ${id} не найдено`);
    }
    
    return equipment;
  } catch (error) {
    console.error(`Ошибка при получении оборудования с ID ${id}:`, error);
    throw error;
  }
};

export const searchEquipment = async (searchTerm: string, filters?: Record<string, string[]>): Promise<Equipment[]> => {
  try {
    // Проверяем наличие активных фильтров
    const hasActiveFilters = filters && Object.values(filters).some(values => values && values.length > 0);
    
    // Если нет поискового запроса и нет фильтров, возвращаем весь список
    if (!searchTerm && !hasActiveFilters) {
      return getEquipmentList();
    }
    
    // Если есть фильтры, но внешний API возвращает ошибку, получаем общий список
    // и фильтруем локально
    try {
      // Формируем базовый URL для запроса
      let url = `${EXTERNAL_API_BASE_URL}/equipments/search?term=${encodeURIComponent(searchTerm || '')}&page=1&pageSize=${PAGE_SIZE}`;
      
      // Добавляем фильтры к URL, если они есть
      if (hasActiveFilters) {
        for (const [key, values] of Object.entries(filters!)) {
          if (values && values.length > 0) {
            // Добавляем каждое значение фильтра как отдельный параметр
            values.forEach(value => {
              url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            });
          }
        }
      }
      
      // Выполняем поиск на внешнем API без AbortController (на некоторых платформах есть проблемы)
      const response = await fetch(url);
      
      // Если ответа нет в течение 5 секунд, продолжаем с локальной фильтрацией
      
      if (!response.ok) {
        throw new Error(`Ошибка при запросе: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем результаты
      if (data && data.results && Array.isArray(data.results)) {
        return data.results.map(mapExternalEquipmentToLocal);
      }
    } catch (apiError) {
      console.error("Ошибка при обращении к внешнему API с фильтрами:", apiError);
      
      // Если запрос с фильтрами не удался, получаем все оборудование и фильтруем локально
      const allEquipment = await getEquipmentList();
      
      let filteredEquipment = allEquipment;
      
      // Фильтрация по поисковому запросу
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredEquipment = filteredEquipment.filter(item => 
          item.name.toLowerCase().includes(lowerSearchTerm) || 
          item.description.toLowerCase().includes(lowerSearchTerm) ||
          (item.category && item.category.toLowerCase().includes(lowerSearchTerm))
        );
      }
      
      // Применяем дополнительные фильтры локально
      if (hasActiveFilters) {
        for (const [filterName, filterValues] of Object.entries(filters!)) {
          if (filterValues && filterValues.length > 0) {
            filteredEquipment = filteredEquipment.filter(item => {
              // Получаем значение для этого фильтра у оборудования
              const itemValue = item[filterName as keyof Equipment];
              
              if (typeof itemValue === 'string') {
                return filterValues.some(value => 
                  itemValue === value || itemValue.includes(value)
                );
              }
              
              return false;
            });
          }
        }
      }
      
      return filteredEquipment;
    }
    
    return [];
  } catch (error) {
    console.error("Ошибка при поиске оборудования:", error);
    return [];
  }
};

// Метод для поиска оборудования
export const findEquipment = async (searchTerm: string): Promise<Equipment[]> => {
  // Используем существующий метод searchEquipment
  return searchEquipment(searchTerm);
};

// Генерируем фиксированный список доступных временных слотов для каждой даты
export const getAvailableTimeSlots = async (equipmentId: number, date: string): Promise<string[]> => {
  try {
    // Генерируем стандартные временные слоты для любой даты и оборудования
    const standardTimeSlots = [
      "09:00-10:00", 
      "10:00-11:00", 
      "11:00-12:00", 
      "12:00-13:00",
      "14:00-15:00", 
      "15:00-16:00", 
      "16:00-17:00", 
      "17:00-18:00"
    ];
    
    return standardTimeSlots;
  } catch (error) {
    console.error(`Ошибка при получении доступных слотов для оборудования ${equipmentId}:`, error);
    return [];
  }
};

// Имитация хранилища для бронирований (т.к. внешний API не поддерживает бронирования)
let localBookings: Booking[] = [];
let nextBookingId = 1;

// Booking API - работает с локальными данными, т.к. внешний API не поддерживает бронирования
export const createBooking = async (bookingData: Omit<InsertBooking, "userId">): Promise<Booking> => {
  try {
    // Создаем новое бронирование
    const newBooking: Booking = {
      id: nextBookingId++,
      equipmentId: bookingData.equipmentId,
      userId: CURRENT_USER_ID,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      purpose: bookingData.purpose,
      additionalRequirements: bookingData.additionalRequirements || null,
      status: "confirmed", // Сразу подтверждаем бронирование
      createdAt: new Date(),
    };
    
    // Сохраняем в локальное хранилище
    localBookings.push(newBooking);
    
    return newBooking;
  } catch (error) {
    console.error("Ошибка при создании бронирования:", error);
    throw error;
  }
};

// Локальное хранилище состояния оборудования
const equipmentStatus: Record<number, { status: string }> = {};

export const getUserBookings = async (): Promise<BookingWithEquipment[]> => {
  try {
    // Получаем все оборудование для добавления в бронирования
    const allEquipment = await getEquipmentList();
    
    // Формируем бронирования с данными оборудования
    const bookingsWithEquipment: BookingWithEquipment[] = await Promise.all(
      localBookings
        .filter(booking => booking.userId === CURRENT_USER_ID)
        .map(async (booking) => {
          // Находим соответствующее оборудование
          const equipment = allEquipment.find(equip => equip.id === booking.equipmentId);
          
          if (!equipment) {
            throw new Error(`Оборудование с ID ${booking.equipmentId} не найдено`);
          }
          
          return {
            ...booking,
            equipment: equipment,
          };
        })
    );
    
    return bookingsWithEquipment;
  } catch (error) {
    console.error("Ошибка при получении бронирований пользователя:", error);
    return [];
  }
};

export const cancelBooking = async (bookingId: number): Promise<Booking> => {
  try {
    // Находим бронирование для отмены
    const bookingIndex = localBookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      throw new Error(`Бронирование с ID ${bookingId} не найдено`);
    }
    
    // Обновляем статус на "отменено"
    localBookings[bookingIndex] = {
      ...localBookings[bookingIndex],
      status: "cancelled",
    };
    
    return localBookings[bookingIndex];
  } catch (error) {
    console.error(`Ошибка при отмене бронирования ${bookingId}:`, error);
    throw error;
  }
};

// Функция для отметки оборудования как "в использовании"
export const useEquipment = async (equipmentId: number): Promise<Equipment> => {
  try {
    // Получаем информацию об оборудовании
    const equipment = await getEquipmentById(equipmentId);
    
    // Обновляем статус в локальном хранилище
    equipmentStatus[equipmentId] = { status: "in_use" };
    
    // Возвращаем обновленное оборудование
    return {
      ...equipment,
      status: "in_use",
    };
  } catch (error) {
    console.error(`Ошибка при изменении статуса оборудования ${equipmentId}:`, error);
    throw error;
  }
};

// Функция для завершения использования оборудования
export const finishUsingEquipment = async (equipmentId: number): Promise<Equipment> => {
  try {
    // Получаем информацию об оборудовании
    const equipment = await getEquipmentById(equipmentId);
    
    // Обновляем статус в локальном хранилище
    equipmentStatus[equipmentId] = { status: "available" };
    
    // Возвращаем обновленное оборудование
    return {
      ...equipment,
      status: "available",
    };
  } catch (error) {
    console.error(`Ошибка при изменении статуса оборудования ${equipmentId}:`, error);
    throw error;
  }
};
