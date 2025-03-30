import { 
  users, type User, type InsertUser,
  equipment, type Equipment, type InsertEquipment,
  bookings, type Booking, type InsertBooking,
  type BookingWithEquipment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Equipment methods
  getAllEquipment(): Promise<Equipment[]>;
  getEquipmentById(id: number): Promise<Equipment | undefined>;
  getEquipmentByCategory(category: string): Promise<Equipment[]>;
  searchEquipment(searchTerm: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipmentStatus(id: number, status: string): Promise<Equipment | undefined>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<BookingWithEquipment[]>;
  getBookingsByEquipmentId(equipmentId: number): Promise<Booking[]>;
  getBookingsByStatus(status: string): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  getBookingsByEquipmentAndDate(equipmentId: number, date: string): Promise<Booking[]>;
}

// Реализация хранилища с использованием базы данных PostgreSQL
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Equipment methods
  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment);
  }

  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    const [item] = await db.select().from(equipment).where(eq(equipment.id, id));
    return item || undefined;
  }

  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    if (category === 'all') {
      return this.getAllEquipment();
    }
    return await db.select().from(equipment).where(eq(equipment.category, category));
  }

  async searchEquipment(searchTerm: string): Promise<Equipment[]> {
    if (!searchTerm) return this.getAllEquipment();
    
    const searchLower = `%${searchTerm.toLowerCase()}%`;
    return await db.select().from(equipment).where(
      or(
        like(equipment.name, searchLower),
        like(equipment.description, searchLower),
        like(equipment.category, searchLower),
        like(equipment.location, searchLower)
      )
    );
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const [equip] = await db
      .insert(equipment)
      .values(insertEquipment)
      .returning();
    return equip;
  }

  async updateEquipmentStatus(id: number, status: string): Promise<Equipment | undefined> {
    const [updated] = await db
      .update(equipment)
      .set({ status })
      .where(eq(equipment.id, id))
      .returning();
    return updated || undefined;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    
    // Update equipment status to booked
    await this.updateEquipmentStatus(insertBooking.equipmentId, "booked");
    
    return booking;
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByUserId(userId: number): Promise<BookingWithEquipment[]> {
    const userBookings = await db.select().from(bookings).where(eq(bookings.userId, userId));
    
    // Attach equipment details to each booking
    const bookingsWithEquipment: BookingWithEquipment[] = [];
    
    for (const booking of userBookings) {
      const equip = await this.getEquipmentById(booking.equipmentId);
      if (equip) {
        bookingsWithEquipment.push({
          ...booking,
          equipment: equip
        });
      }
    }
    
    return bookingsWithEquipment;
  }

  async getBookingsByEquipmentId(equipmentId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.equipmentId, equipmentId));
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.status, status));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    
    // If booking is cancelled, update equipment status back to available
    if (status === "cancelled" && updated) {
      await this.updateEquipmentStatus(updated.equipmentId, "available");
    }
    
    return updated || undefined;
  }

  async getBookingsByEquipmentAndDate(equipmentId: number, date: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(
      and(
        eq(bookings.equipmentId, equipmentId),
        eq(bookings.date, date)
      )
    );
  }
}

// Create a singleton instance of the storage
export const storage = new DatabaseStorage();
