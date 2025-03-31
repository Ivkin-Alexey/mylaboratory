import { apiRequest } from "./queryClient";
import type { Equipment, InsertBooking, BookingWithEquipment, Booking } from "@shared/schema";
import { IEquipmentItem } from "@/models/equipments";

// User ID (mock user for demo, in a real app this would come from auth)
const CURRENT_USER_ID = 1;

// Внешний API URL
const EXTERNAL_API_BASE_URL = "https://scmp-bot-server.ru/api";
const PAGE_SIZE = 100; // Большой размер страницы для получения всех результатов

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

export const searchEquipment = async (searchTerm: string): Promise<Equipment[]> => {
  try {
    // Если поисковый запрос пустой, возвращаем весь список
    if (!searchTerm) {
      return getEquipmentList();
    }
    
    // Выполняем поиск на внешнем API
    const response = await fetchFromExternalApi(
      `${EXTERNAL_API_BASE_URL}/equipments/search?term=${encodeURIComponent(searchTerm)}&page=1&pageSize=${PAGE_SIZE}`
    );
    
    // Преобразуем результаты
    if (response && response.results && Array.isArray(response.results)) {
      return response.results.map(mapExternalEquipmentToLocal);
    }
    
    return [];
  } catch (error) {
    console.error("Ошибка при поиске оборудования:", error);
    return [];
  }
};

// Альтернативный метод поиска с параметром q (использует тот же внешний API)
export const findEquipment = async (searchTerm: string): Promise<Equipment[]> => {
  return searchEquipment(searchTerm);
};

export const getEquipmentByCategory = async (category: string): Promise<Equipment[]> => {
  try {
    // Получаем весь список оборудования и фильтруем по категории
    const allEquipment = await getEquipmentList();
    
    // Если категория "all", возвращаем весь список
    if (category === "all") {
      return allEquipment;
    }
    
    // Иначе фильтруем по категории
    return allEquipment.filter(item => {
      // Проверяем, содержит ли категория оборудования нужную подстроку
      return item.category.toLowerCase().includes(category.toLowerCase());
    });
  } catch (error) {
    console.error(`Ошибка при получении оборудования по категории ${category}:`, error);
    return [];
  }
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
    
    // В реальном приложении здесь был бы запрос к API для проверки доступности
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
