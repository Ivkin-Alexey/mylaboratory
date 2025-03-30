import { 
  users, type User, type InsertUser,
  equipment, type Equipment, type InsertEquipment,
  bookings, type Booking, type InsertBooking,
  type BookingWithEquipment
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private equipment: Map<number, Equipment>;
  private bookings: Map<number, Booking>;
  private userCurrentId: number;
  private equipmentCurrentId: number;
  private bookingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.equipment = new Map();
    this.bookings = new Map();
    this.userCurrentId = 1;
    this.equipmentCurrentId = 1;
    this.bookingCurrentId = 1;
    
    // Add test user
    this.initTestUser();
    
    // Add sample equipment
    this.initSampleEquipment();
  }

  // Initialize test user
  private initTestUser() {
    const testUser = {
      username: "testuser",
      password: "password123", // Добавлено для соответствия схеме
    };
    this.createUser(testUser);
  }

  // Initialize sample equipment
  private initSampleEquipment() {
    const sampleEquipment: InsertEquipment[] = [
      {
        name: "Electron Microscope XLS-300",
        description: "High-resolution imaging for nanoscale specimens",
        category: "microscopes",
        location: "Lab 102",
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1581092921461-39b90de3f0e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
      },
      {
        name: "Mass Spectrometer QT-5000",
        description: "High-precision molecular analysis equipment",
        category: "spectrometers",
        location: "Lab 205",
        status: "maintenance",
        imageUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
      },
      {
        name: "High-Speed Centrifuge CS-9000",
        description: "Precision separation for molecular research",
        category: "centrifuges",
        location: "Lab 118",
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1581093196277-9f608bb3a2ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
      },
      {
        name: "PCR Thermal Cycler TC-200",
        description: "Precision DNA amplification system",
        category: "analyzers",
        location: "Lab 301",
        status: "booked",
        imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
      },
      {
        name: "HPLC System 8000 Series",
        description: "High-performance liquid chromatography analyzer",
        category: "analyzers",
        location: "Lab 212",
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1613843873842-d9e33df925e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
      },
      {
        name: "Flow Cytometer FC-500",
        description: "Cell analysis and sorting system",
        category: "analyzers",
        location: "Lab 108",
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
      }
    ];

    sampleEquipment.forEach(item => {
      this.createEquipment(item);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Equipment methods
  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }

  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    return Array.from(this.equipment.values()).filter(
      (item) => item.category === category || category === 'all'
    );
  }

  async searchEquipment(searchTerm: string): Promise<Equipment[]> {
    if (!searchTerm) return this.getAllEquipment();
    
    const searchLower = searchTerm.toLowerCase();
    return Array.from(this.equipment.values()).filter(
      (item) => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower)
    );
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentCurrentId++;
    const equipment: Equipment = { ...insertEquipment, id };
    this.equipment.set(id, equipment);
    return equipment;
  }

  async updateEquipmentStatus(id: number, status: string): Promise<Equipment | undefined> {
    const equipment = await this.getEquipmentById(id);
    if (!equipment) return undefined;
    
    const updatedEquipment: Equipment = { ...equipment, status };
    this.equipment.set(id, updatedEquipment);
    return updatedEquipment;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingCurrentId++;
    const booking: Booking = { ...insertBooking, id, createdAt: new Date() };
    this.bookings.set(id, booking);
    
    // Update equipment status to booked
    await this.updateEquipmentStatus(insertBooking.equipmentId, "booked");
    
    return booking;
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUserId(userId: number): Promise<BookingWithEquipment[]> {
    const userBookings = Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
    
    // Attach equipment details to each booking
    const bookingsWithEquipment: BookingWithEquipment[] = [];
    
    for (const booking of userBookings) {
      const equipment = await this.getEquipmentById(booking.equipmentId);
      if (equipment) {
        bookingsWithEquipment.push({
          ...booking,
          equipment
        });
      }
    }
    
    return bookingsWithEquipment;
  }

  async getBookingsByEquipmentId(equipmentId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.equipmentId === equipmentId
    );
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.status === status
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = await this.getBookingById(id);
    if (!booking) return undefined;
    
    const updatedBooking: Booking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    
    // If booking is cancelled, update equipment status back to available
    if (status === "cancelled") {
      await this.updateEquipmentStatus(booking.equipmentId, "available");
    }
    
    return updatedBooking;
  }

  async getBookingsByEquipmentAndDate(equipmentId: number, date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.equipmentId === equipmentId && booking.date === date
    );
  }
}

// Create a singleton instance of the storage
export const storage = new MemStorage();
