import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Equipment categories enum
export const EquipmentCategory = {
  MICROSCOPES: "microscopes",
  ANALYZERS: "analyzers",
  SPECTROMETERS: "spectrometers",
  CENTRIFUGES: "centrifuges",
} as const;

export type EquipmentCategoryType = typeof EquipmentCategory[keyof typeof EquipmentCategory];

// Equipment status enum
export const EquipmentStatus = {
  AVAILABLE: "available",
  BOOKED: "booked",
  MAINTENANCE: "maintenance",
} as const;

export type EquipmentStatusType = typeof EquipmentStatus[keyof typeof EquipmentStatus];

// Equipment table
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // One of EquipmentCategory
  location: text("location").notNull(),
  status: text("status").notNull().default(EquipmentStatus.AVAILABLE), // One of EquipmentStatus
  imageUrl: text("image_url"),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
});

export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

// Booking status enum
export const BookingStatus = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  timeSlot: text("time_slot").notNull(), // Format: "HH:MM-HH:MM"
  purpose: text("purpose").notNull(),
  additionalRequirements: text("additional_requirements"),
  status: text("status").notNull().default(BookingStatus.PENDING),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Extended booking type that includes equipment details
export type BookingWithEquipment = Booking & {
  equipment: Equipment;
};
