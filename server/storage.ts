// Базовый интерфейс хранилища
export interface IStorage {
  // Заглушка для совместимости
}

// Класс для хранения данных в памяти
export class MemStorage implements IStorage {
  // Заглушка для совместимости
}

export const storage = new MemStorage();