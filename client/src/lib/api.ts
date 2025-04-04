import { encodeQueryParams } from "@/constants";

// Определение типов для клиентской части
export interface Booking {
  id: number;
  equipmentId: string; // ID оборудования теперь строка
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
const PAGE_SIZE = 38; // Количество карточек на странице по запросу пользователя

// Тип Equipment для внутреннего использования в клиенте
export interface Equipment {
  id: string;
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
  
  // Дополнительные поля из API
  classification?: string;    // Классификация оборудования 
  measurements?: string;      // Измерения, которые может делать оборудование
  department?: string;        // Подразделение/кафедра
  type?: string;              // Тип оборудования
  kind?: string;              // Вид оборудования
  filesUrl?: string;          // Ссылка на документацию/файлы
  quantity?: number;          // Количество единиц оборудования
}

// Тип InsertBooking для бронирований
export interface InsertBooking {
  equipmentId: string;
  userId: number;
  date: string;
  timeSlot: string;
  purpose: string;
  additionalRequirements?: string | null;
}

// Функция для создания уникального ID из инвентарного и серийного номеров
const generateUniqueId = (item: any): string => {
  // Проверяем наличие инвентарного и серийного номеров
  if (item.inventoryNumber && item.serialNumber) {
    // Объединяем инвентарный и серийный номера в строку
    return `${item.inventoryNumber}${item.serialNumber}`;
  } else if (item.inventoryNumber) {
    // Если есть только инвентарный номер
    return item.inventoryNumber;
  } else if (item.serialNumber) {
    // Если есть только серийный номер
    return item.serialNumber;
  } else {
    // Если нет ни одного номера, используем ID с API
    return item.id;
  }
};

// Функция для маппинга данных с внешнего API в формат нашего приложения
const mapExternalEquipmentToLocal = (item: any): Equipment => {
  return {
    id: generateUniqueId(item), // Используем комбинацию инвентарного и серийного номеров
    name: item.name,
    description: item.description,
    category: item.classification ? item.classification.toLowerCase().split(' ')[0] : "other",
    location: item.department || "Не указано",
    status: "available", // По умолчанию все оборудование доступно
    imageUrl: item.imgUrl,
    usageType: "booking_required", // По умолчанию требуется бронирование
    brand: item.brand,
    model: item.model,
    serialNumber: item.serialNumber,
    inventoryNumber: item.inventoryNumber,
    
    // Дополнительные поля из внешнего API
    classification: item.classification || "",
    measurements: item.measurements || "",
    department: item.department || "",
    type: item.type || "",
    kind: item.kind || "",
    filesUrl: item.filesUrl || "",
    quantity: item.quantity || 1, // Если quantity не указано, считаем что есть 1 единица
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
    // API требует, чтобы были указаны либо поисковая фраза, либо фильтры
    // Указываем фиктивный фильтр для получения всех данных
    const defaultFilter = ["Научное оборудование"];
    const encodedFilter = encodeURIComponent(JSON.stringify(defaultFilter));
    const url = `${EXTERNAL_API_BASE_URL}/equipments/search?kind=${encodedFilter}&page=1&pageSize=${PAGE_SIZE}`;
    console.log("Запрос к внешнему API:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ошибка при запросе: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Преобразуем данные в формат приложения
    if (data && data.results && Array.isArray(data.results)) {
      return data.results.map(mapExternalEquipmentToLocal);
    }
    
    return [];
  } catch (error) {
    console.error("Ошибка при получении списка оборудования:", error);
    return [];
  }
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  try {
    // Используем ID напрямую для запроса к внешнему API
    const url = `${EXTERNAL_API_BASE_URL}/equipments/${id}`;
    
    console.log(`Запрос к внешнему API для получения оборудования по ID: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Ошибка при запросе к внешнему API: ${response.status}`);
      // Если запрос не удался, возвращаемся к старому методу - поиску в списке
      const allEquipment = await getEquipmentList();
      const equipment = allEquipment.find(item => item.id === id);
      
      if (!equipment) {
        throw new Error(`Оборудование с ID ${id} не найдено`);
      }
      
      return equipment;
    }
    
    // Обрабатываем ответ от внешнего API
    const externalEquipment = await response.json();
    
    // Маппим данные в наш формат
    return mapExternalEquipmentToLocal(externalEquipment);
  } catch (error) {
    console.error(`Ошибка при получении оборудования с ID ${id}:`, error);
    throw error;
  }
};

export const searchEquipment = async (searchTerm: string, filters?: Record<string, string[]>): Promise<Equipment[]> => {
  try {
    // Проверяем наличие активных фильтров
    const hasActiveFilters = filters && Object.values(filters).some(values => values && values.length > 0);
    
    // Если нет поискового запроса и нет фильтров, добавляем фиктивный фильтр
    // (API требует наличие поискового запроса или хотя бы одного фильтра)
    
    // Формируем базовый URL для запроса
    let url = `${EXTERNAL_API_BASE_URL}/equipments/search?term=${encodeURIComponent(searchTerm || '')}&page=1&pageSize=${PAGE_SIZE}`;
    
    // Если нет ни поискового запроса, ни фильтров, добавляем фиктивный фильтр для получения всех данных
    if (!searchTerm && !hasActiveFilters) {
      const defaultFilter = ["Научное оборудование"];
      url += `&kind=${encodeURIComponent(JSON.stringify(defaultFilter))}`;
    }
    
    // Добавляем фильтры к URL, если они есть
    if (hasActiveFilters) {
      for (const [key, values] of Object.entries(filters!)) {
        if (values && values.length > 0) {
          // Добавляем значения фильтра как массив JSON
          const encodedValues = encodeURIComponent(JSON.stringify(values));
          url += `&${encodeURIComponent(key)}=${encodedValues}`;
        }
      }
    }
    
    console.log("Запрос к внешнему API:", url);
    
    // Выполняем запрос к внешнему API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ошибка при запросе: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Выводим в консоль полный ответ API для анализа структуры
    console.log("Ответ от API поиска оборудования:", data);
    
    // Преобразуем результаты
    if (data && data.results && Array.isArray(data.results)) {
      return data.results.map(mapExternalEquipmentToLocal);
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
export const getAvailableTimeSlots = async (equipmentId: string, date: string): Promise<string[]> => {
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
const equipmentStatus: Record<string, { status: string }> = {};

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
export const useEquipment = async (equipmentId: string): Promise<Equipment> => {
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
export const finishUsingEquipment = async (equipmentId: string): Promise<Equipment> => {
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

/**
 * Получение оборудования по списку ID - специально для избранного
 * @param equipmentIds массив ID оборудования
 * @returns массив оборудования
 */
export const getEquipmentByIds = async (equipmentIds: string[]): Promise<Equipment[]> => {
  try {
    if (!equipmentIds || equipmentIds.length === 0) {
      return [];
    }
    
    // Объединяем ID через запятую и кодируем для URL
    const idsParam = encodeURIComponent(equipmentIds.join(','));
    const url = `${EXTERNAL_API_BASE_URL}/equipments?equipmentIds=${idsParam}`;
    
    console.log(`Запрос к внешнему API для получения оборудования по ID: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Ошибка при запросе к внешнему API: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      return data.map(mapExternalEquipmentToLocal);
    }
    
    return [];
  } catch (error) {
    console.error("Ошибка при получении оборудования по ID:", error);
    return [];
  }
};
