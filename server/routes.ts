import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookingSchema, 
  insertEquipmentSchema,
  EquipmentStatus, 
  BookingStatus 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get all equipment
  app.get("/api/equipment", async (req: Request, res: Response) => {
    try {
      const equipment = await storage.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching equipment" });
    }
  });

  // Get equipment by ID
  app.get("/api/equipment/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid equipment ID" });
      }

      const equipment = await storage.getEquipmentById(id);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching equipment" });
    }
  });

  // Search equipment
  app.get("/api/equipment/search", async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.term as string || "";
      const equipment = await storage.searchEquipment(searchTerm);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Error searching equipment" });
    }
  });

  // Filter equipment by category
  app.get("/api/equipment/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const equipment = await storage.getEquipmentByCategory(category);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Error filtering equipment" });
    }
  });

  // Create new equipment
  app.post("/api/equipment", async (req: Request, res: Response) => {
    try {
      const equipmentData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(equipmentData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Некорректные данные оборудования", errors: error.errors });
      }
      res.status(500).json({ message: "Ошибка при добавлении оборудования" });
    }
  });

  // Create a booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if equipment exists
      const equipment = await storage.getEquipmentById(bookingData.equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      // Check if equipment is available
      if (equipment.status !== EquipmentStatus.AVAILABLE) {
        return res.status(400).json({ message: "Equipment is not available for booking" });
      }
      
      // Check if the time slot is available for this date and equipment
      const existingBookings = await storage.getBookingsByEquipmentAndDate(
        bookingData.equipmentId,
        bookingData.date
      );
      
      const isTimeSlotTaken = existingBookings.some(
        booking => booking.timeSlot === bookingData.timeSlot && 
                  booking.status !== BookingStatus.CANCELLED
      );
      
      if (isTimeSlotTaken) {
        return res.status(400).json({ message: "This time slot is already booked" });
      }
      
      // Create the booking
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating booking" });
    }
  });

  // Get user's bookings
  app.get("/api/bookings/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });

  // Cancel a booking
  app.patch("/api/bookings/:id/cancel", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if booking can be cancelled (not already completed or cancelled)
      if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
        return res.status(400).json({ message: `Booking cannot be cancelled because it is ${booking.status}` });
      }

      const updatedBooking = await storage.updateBookingStatus(id, BookingStatus.CANCELLED);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Error cancelling booking" });
    }
  });

  // Get available time slots for a specific equipment on a specific date
  app.get("/api/equipment/:id/available-slots", async (req: Request, res: Response) => {
    try {
      const equipmentId = parseInt(req.params.id);
      const date = req.query.date as string;
      
      if (isNaN(equipmentId) || !date) {
        return res.status(400).json({ message: "Invalid equipment ID or date" });
      }

      // Check if equipment exists
      const equipment = await storage.getEquipmentById(equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      // Get all bookings for this equipment on this date
      const bookings = await storage.getBookingsByEquipmentAndDate(equipmentId, date);
      
      // Define all available time slots
      const allTimeSlots = [
        "9:00-11:00",
        "11:00-13:00",
        "13:00-15:00",
        "15:00-17:00"
      ];
      
      // Filter out booked time slots
      const bookedSlots = bookings
        .filter(booking => booking.status !== BookingStatus.CANCELLED)
        .map(booking => booking.timeSlot);
      
      const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
      
      res.json({ availableSlots });
    } catch (error) {
      res.status(500).json({ message: "Error fetching available time slots" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
