import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi } from "@/lib/api";
import type { Event } from "@/types";

const CATEGORIES = ["All", "Technology", "Business", "Arts", "Sports", "Community", "Education"];

function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.capacity - event._count.tickets;
  const isFull = spotsLeft <= 0;
  const date = new Date(event.dateTime);

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="size-12 text-muted-foreground/30" />
          </div>
        )}
        {event.category && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            {event.category}
          </Badge>
        )}
        {isFull && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            Full
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <h3 className="font-semibold leading-tight line-clamp-2">{event.title}</h3>
      </CardHeader>
      <CardContent className="flex-1 space-y-1.5 text-sm text-muted-foreground pb-2">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0" />
          <span>{date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span className="text-xs">·</span>
          <span>{date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 shrink-0" />
          <span>{isFull ? "No spots remaining" : `${spotsLeft} of ${event.capacity} spots left`}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={isFull ? "outline" : "default"} size="sm">
          <Link to={`/events/${event.id}`}>{isFull ? "Join Waitlist" : "View & Register"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video" />
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string> = {};
    if (search) params["search"] = search;
    if (category !== "All") params["category"] = category;

    eventsApi
      .list(params)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, [search, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground text-sm">Discover and register for events in your area</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "default" : "outline"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="size-12 text-muted-foreground/40 mb-3" />
          <p className="font-medium">No events found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}
