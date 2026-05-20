import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { CheckInPage } from "@/pages/checkin/CheckInPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { CreateEventPage } from "@/pages/events/CreateEventPage";
import { EventDetailPage } from "@/pages/events/EventDetailPage";
import { EventsPage } from "@/pages/events/EventsPage";
import { TicketsPage } from "@/pages/tickets/TicketsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route index element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Any authenticated user */}
          <Route
            path="/tickets"
            element={<ProtectedRoute><TicketsPage /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />

          {/* Organisers only */}
          <Route
            path="/events/new"
            element={<ProtectedRoute requiredRole="ORGANISER"><CreateEventPage /></ProtectedRoute>}
          />
          <Route
            path="/checkin/:eventId"
            element={<ProtectedRoute requiredRole="ORGANISER"><CheckInPage /></ProtectedRoute>}
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="bottom-right" />
    </BrowserRouter>
  );
}
