import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Заглушка для совместимости
// В данном приложении мы используем внешний API, а не базу данных

// Базовая модель пользователя для совместимости
export const users = {} as any;
export type User = any;
export type InsertUser = any;

// Категории оборудования 
export enum EquipmentCategory {
  SCIENTIFIC = "Научное оборудование",
  LABORATORY = "Лабораторное оборудование",
  MEASUREMENT = "Измерительное оборудование",
  MEDICAL = "Медицинское оборудование",
  OTHER = "Прочее"
}

// Статусы оборудования
export enum EquipmentStatus {
  AVAILABLE = "Доступно",
  IN_USE = "Используется",
  BOOKED = "Забронировано",
  MAINTENANCE = "На обслуживании",
  REPAIR = "В ремонте"
}

// Заглушка для InsertEquipment
export type InsertEquipment = any;