import { CalendarDays, Plus, QrCode, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Event } from "@/types";

function EventRow({ event }: { event: Event }) {
  const date = new Date(event.dateTime);
  const registered = event._count.tickets;
  const fillPct = Math.round((registered / event.capacity) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base line-clamp-1">{event.title}</CardTitle>
          <Badge variant={event.status === "PUBLISHED" ? "default" : "secondary"}>{event.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })} · {event.location}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="size-3.5" /> {registered} / {event.capacity} registered
          </span>
          <span className="font-medium">{fillPct}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${fillPct}%` }} />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to={`/events/${event.id}`}>View</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={`/events/${event.id}/edit`}>Edit</Link>
        </Button>
        <Button asChild size="sm">
          <Link to={`/checkin/${event.id}`}>
            <QrCode className="mr-1.5 size-3.5" /> Check-In
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DashboardPage() {
  const { user, token, isOrganiser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    eventsApi
      .list()
      .then((all) => {
        const mine = isOrganiser ? all.filter((e) => e.organiserId === user?.id) : all;
        setEvents(mine);
      })
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, [user, isOrganiser]);

  const totalRegistered = events.reduce((sum, e) => sum + e._count.tickets, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        {isOrganiser && (
          <Button asChild>
            <Link to="/events/new">
              <Plus className="mr-2 size-4" /> Create Event
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isOrganiser ? "My Events" : "Events Available"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              {isLoading ? <Skeleton className="h-7 w-8" /> : events.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isOrganiser ? "Total Registered" : "My Tickets"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              {isLoading ? <Skeleton className="h-7 w-8" /> : totalRegistered}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Users className="size-5 text-primary" />
              {user?.role ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events list (organisers only) */}
      {isOrganiser && (
        <div>
          <h2 className="font-semibold mb-3">Your Events</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
              <CalendarDays className="size-10 text-muted-foreground/40 mb-2" />
              <p className="font-medium">No events yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first event to get started</p>
              <Button asChild size="sm"><Link to="/events/new">Create Event</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((e) => <EventRow key={e.id} event={e} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
