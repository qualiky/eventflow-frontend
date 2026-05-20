import type { AuthResponse, CheckInStats, Event, Ticket, User } from "@/types";

const API_BASE = (typeof process !== "undefined" && process.env["BUN_PUBLIC_API_URL"]) || "http://localhost:3001/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options.headers } });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, (body as { error: string }).error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: (token: string) => request<User>("/auth/me", {}, token),

  updateProfile: (data: { name?: string; avatarUrl?: string }, token: string) =>
    request<User>("/auth/me", { method: "PATCH", body: JSON.stringify(data) }, token),
};

export const eventsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<Event[]>(`/events${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) => request<Event>(`/events/${id}`),

  create: (data: Partial<Event>, token: string) =>
    request<Event>("/events", { method: "POST", body: JSON.stringify(data) }, token),

  update: (id: string, data: Partial<Event>, token: string) =>
    request<Event>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),

  cancel: (id: string, token: string) =>
    request<Event>(`/events/${id}`, { method: "DELETE" }, token),

  getAttendees: (id: string, token: string) =>
    request<Array<{ id: string; user: User }>>(` /events/${id}/attendees`, {}, token),
};

export const ticketsApi = {
  register: (eventId: string, data: { ticketType?: string }, token: string) =>
    request<Ticket>(`/events/${eventId}/register`, { method: "POST", body: JSON.stringify(data) }, token),

  myTickets: (token: string) => request<Ticket[]>("/tickets", {}, token),

  getById: (id: string, token: string) => request<Ticket>(`/tickets/${id}`, {}, token),

  cancel: (id: string, token: string) =>
    request<Ticket>(`/tickets/${id}`, { method: "DELETE" }, token),
};

export const checkinApi = {
  scan: (qrCode: string, token: string) =>
    request<{ checkIn: CheckInStats; attendee: User }>("/checkin/scan", { method: "POST", body: JSON.stringify({ qrCode }) }, token),

  manual: (data: { email: string; eventId: string }, token: string) =>
    request<{ checkIn: CheckInStats; attendee: User }>("/checkin/manual", { method: "POST", body: JSON.stringify(data) }, token),

  getStats: (eventId: string, token: string) =>
    request<CheckInStats>(`/checkin/events/${eventId}`, {}, token),
};

export { ApiError };
