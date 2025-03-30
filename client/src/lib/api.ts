import { apiRequest } from "./queryClient";
import type { Equipment, InsertBooking, BookingWithEquipment, Booking } from "@shared/schema";

// User ID (mock user for demo, in a real app this would come from auth)
const CURRENT_USER_ID = 1;

// Equipment API
export const getEquipmentList = async (): Promise<Equipment[]> => {
  const response = await apiRequest("GET", "/api/equipment", undefined);
  return response.json();
};

export const getEquipmentById = async (id: number): Promise<Equipment> => {
  const response = await apiRequest("GET", `/api/equipment/${id}`, undefined);
  return response.json();
};

export const searchEquipment = async (searchTerm: string): Promise<Equipment[]> => {
  const response = await apiRequest("GET", `/api/equipment/search?term=${encodeURIComponent(searchTerm)}`, undefined);
  return response.json();
};

export const getEquipmentByCategory = async (category: string): Promise<Equipment[]> => {
  const response = await apiRequest("GET", `/api/equipment/category/${category}`, undefined);
  return response.json();
};

export const getAvailableTimeSlots = async (equipmentId: number, date: string): Promise<string[]> => {
  const response = await apiRequest("GET", `/api/equipment/${equipmentId}/available-slots?date=${date}`, undefined);
  const data = await response.json();
  return data.availableSlots;
};

// Booking API
export const createBooking = async (bookingData: Omit<InsertBooking, "userId">): Promise<Booking> => {
  const response = await apiRequest("POST", "/api/bookings", {
    ...bookingData,
    userId: CURRENT_USER_ID,
  });
  return response.json();
};

export const getUserBookings = async (): Promise<BookingWithEquipment[]> => {
  const response = await apiRequest("GET", `/api/bookings/user/${CURRENT_USER_ID}`, undefined);
  return response.json();
};

export const cancelBooking = async (bookingId: number): Promise<Booking> => {
  const response = await apiRequest("PATCH", `/api/bookings/${bookingId}/cancel`, undefined);
  return response.json();
};

// Функция для отметки оборудования как "в использовании"
export const useEquipment = async (equipmentId: number): Promise<Equipment> => {
  const response = await apiRequest("PATCH", `/api/equipment/${equipmentId}/use`, undefined);
  return response.json();
};
