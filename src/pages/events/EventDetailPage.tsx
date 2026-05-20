import { ArrowLeft, CalendarDays, Loader2, MapPin, QrCode, Tag, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi, ticketsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Event } from "@/types";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isOrganiser, token, user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    eventsApi
      .getById(id)
      .then(setEvent)
      .catch(() => navigate("/events", { replace: true }))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  async function handleRegister() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    if (!id || !token) return;

    setIsRegistering(true);
    try {
      await ticketsApi.register(id, { ticketType: "FREE" }, token);
      toast.success("Registered! Your ticket is in My Tickets.");
      navigate("/tickets");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="aspect-video rounded-lg" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!event) return null;

  const spotsLeft = event.capacity - event._count.tickets;
  const isFull = spotsLeft <= 0;
  const isCancelled = event.status === "CANCELLED";
  const isOwnEvent = user?.id === event.organiserId;
  const date = new Date(event.dateTime);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/events">
          <ArrowLeft className="mr-1.5 size-4" /> Back to Events
        </Link>
      </Button>

      {/* Banner */}
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="size-16 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {event.category && <Badge variant="secondary">{event.category}</Badge>}
              {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">by {event.organiser.name}</p>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span>{date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              <span>·</span>
              <span>{date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span>{isFull ? "No spots remaining" : `${spotsLeft} of ${event.capacity} spots remaining`}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="font-semibold mb-2">About this event</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {isFull ? "Event Full" : "Register"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">Free</div>
              {!isCancelled && !isOwnEvent && (
                <Button
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isRegistering}
                  variant={isFull ? "outline" : "default"}
                >
                  {isRegistering && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {isFull ? "Join Waitlist" : isAuthenticated ? "Register Now" : "Log in to Register"}
                </Button>
              )}
              {isOwnEvent && isOrganiser && (
                <div className="space-y-2">
                  <Button asChild className="w-full" variant="outline" size="sm">
                    <Link to={`/events/${event.id}/edit`}>Edit Event</Link>
                  </Button>
                  <Button asChild className="w-full" size="sm">
                    <Link to={`/checkin/${event.id}`}>
                      <QrCode className="mr-2 size-4" /> Check-In Dashboard
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
