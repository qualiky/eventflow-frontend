import { CalendarDays, Loader2, MapPin, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ticketsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Ticket as TicketType } from "@/types";

const STATUS_VARIANT = {
  CONFIRMED: "default",
  CANCELLED: "destructive",
  WAITLISTED: "secondary",
} as const;

function TicketCard({ ticket, onCancel }: { ticket: TicketType; onCancel: (id: string) => void }) {
  const [showQR, setShowQR] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const { token } = useAuth();
  const date = ticket.event ? new Date(ticket.event.dateTime) : null;

  async function loadQR() {
    if (!token || qrDataUrl) { setShowQR(true); return; }
    try {
      const full = await ticketsApi.getById(ticket.id, token);
      setQrDataUrl(full.qrDataUrl ?? null);
      setShowQR(true);
    } catch {
      toast.error("Failed to load QR code");
    }
  }

  async function handleCancel() {
    if (!token) return;
    setIsCancelling(true);
    try {
      await ticketsApi.cancel(ticket.id, token);
      toast.success("Ticket cancelled");
      onCancel(ticket.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight line-clamp-2">
              {ticket.event?.title ?? "Event"}
            </CardTitle>
            <Badge variant={STATUS_VARIANT[ticket.status]}>{ticket.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground space-y-1.5">
          {date && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              <span>{date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          )}
          {ticket.event?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              <span className="truncate">{ticket.event.location}</span>
            </div>
          )}
          {ticket.checkIn && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Checked in {new Date(ticket.checkIn.checkedInAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </CardContent>
        <CardFooter className="gap-2 flex-wrap">
          {ticket.status === "CONFIRMED" && (
            <>
              <Button size="sm" variant="outline" onClick={loadQR}>
                Show QR
              </Button>
              <Button size="sm" variant="destructive" disabled={isCancelling} onClick={handleCancel}>
                {isCancelling && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                Cancel
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" asChild>
            <Link to={`/events/${ticket.eventId}`}>View Event</Link>
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>{ticket.event?.title}</DialogTitle>
            <DialogDescription>Present this QR code at the venue</DialogDescription>
          </DialogHeader>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Ticket QR code" className="mx-auto rounded-md w-48 h-48" />
          ) : (
            <Skeleton className="mx-auto w-48 h-48 rounded-md" />
          )}
          <p className="text-xs text-muted-foreground font-mono break-all">{ticket.id}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    ticketsApi
      .myTickets(token)
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setIsLoading(false));
  }, [token]);

  function handleCancelled(id: string) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "CANCELLED" } : t)));
  }

  const active = tickets.filter((t) => t.status !== "CANCELLED");
  const past = tickets.filter((t) => t.status === "CANCELLED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <p className="text-sm text-muted-foreground">Your event registrations</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Ticket className="size-12 text-muted-foreground/40 mb-3" />
          <p className="font-medium">No tickets yet</p>
          <p className="text-sm text-muted-foreground mb-4">Browse events and register to get started</p>
          <Button asChild><Link to="/events">Browse Events</Link></Button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Active</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((t) => <TicketCard key={t.id} ticket={t} onCancel={handleCancelled} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Cancelled</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((t) => <TicketCard key={t.id} ticket={t} onCancel={handleCancelled} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
