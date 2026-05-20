export type UserRole = "ATTENDEE" | "ORGANISER" | "ADMIN";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
export type TicketStatus = "CONFIRMED" | "CANCELLED" | "WAITLISTED";
export type TicketType = "FREE" | "PAID";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  capacity: number;
  imageUrl?: string;
  category?: string;
  status: EventStatus;
  organiserId: string;
  organiser: { id: string; name: string };
  _count: { tickets: number };
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  qrCode: string;
  qrDataUrl?: string;
  ticketType: TicketType;
  status: TicketStatus;
  event?: Pick<Event, "id" | "title" | "dateTime" | "location" | "imageUrl" | "status">;
  checkIn?: CheckIn;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  ticketId: string;
  checkedInAt: string;
  checkedInBy: string;
}

export interface CheckInStats {
  event: { id: string; title: string; capacity: number };
  registered: number;
  checkedIn: number;
  remaining: number;
  checkInRate: number;
  recent: Array<{
    id: string;
    checkedInAt: string;
    ticket: { user: { name: string; email: string } };
  }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
