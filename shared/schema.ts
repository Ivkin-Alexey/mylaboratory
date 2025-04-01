import { pgTable, text, timestamp, integer, boolean, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Пользователи
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Категории оборудования (словарь)
export const EquipmentCategory = {
  LAB: "laboratory",
  FIELD: "field",
  OFFICE: "office",
  OTHER: "other",
} as const;
export type EquipmentCategoryType = typeof EquipmentCategory[keyof typeof EquipmentCategory];

// Статусы оборудования (словарь)
export const EquipmentStatus = {
  AVAILABLE: "available",
  BOOKED: "booked",
  IN_USE: "in_use",
  MAINTENANCE: "maintenance",
} as const;
export type EquipmentStatusType = typeof EquipmentStatus[keyof typeof EquipmentStatus];

// Типы использования оборудования (словарь)
export const EquipmentUsageType = {
  BOOKING_REQUIRED: "booking_required", // Требует бронирования
  IMMEDIATE_USE: "immediate_use",       // Можно взять сразу
  LONG_TERM: "long_term",               // Длительное использование
} as const;
export type EquipmentUsageTypeValue = typeof EquipmentUsageType[keyof typeof EquipmentUsageType];

// Оборудование
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(), 
  status: text("status").notNull().default(EquipmentStatus.AVAILABLE), 
  imageUrl: text("image_url"),
  usageType: text("usage_type").notNull().default(EquipmentUsageType.BOOKING_REQUIRED),
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number"),
  inventoryNumber: text("inventory_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
});
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

// Статусы бронирования (словарь)
export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;
export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

// Бронирования
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // Формат YYYY-MM-DD
  timeSlot: text("time_slot").notNull(), // Формат "09:00-10:00"
  purpose: text("purpose").notNull(),
  additionalRequirements: text("additional_requirements"),
  status: text("status").notNull().default(BookingStatus.CONFIRMED),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Тип для бронирования с включенной информацией об оборудовании
export type BookingWithEquipment = Booking & {
  equipment: Equipment;
};