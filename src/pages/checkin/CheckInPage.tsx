import { ArrowLeft, CheckCircle, Loader2, QrCode, Search, Users, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkinApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { CheckInStats } from "@/types";

export function CheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { token } = useAuth();

  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // QR (manual text) state
  const [qrInput, setQrInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Manual check-in state
  const [manualEmail, setManualEmail] = useState("");
  const [isManual, setIsManual] = useState(false);

  const qrRef = useRef<HTMLInputElement>(null);

  function refreshStats() {
    if (!eventId || !token) return;
    checkinApi
      .getStats(eventId, token)
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoadingStats(false));
  }

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10_000);
    return () => clearInterval(interval);
  }, [eventId, token]);

  async function handleQRScan(e: React.FormEvent) {
    e.preventDefault();
    if (!qrInput.trim() || !token) return;
    setIsScanning(true);
    try {
      const result = await checkinApi.scan(qrInput.trim(), token);
      toast.success(`✓ Checked in: ${(result as unknown as { attendee: { name: string } }).attendee.name}`);
      setQrInput("");
      qrRef.current?.focus();
      refreshStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setIsScanning(false);
    }
  }

  async function handleManualCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!manualEmail.trim() || !eventId || !token) return;
    setIsManual(true);
    try {
      const result = await checkinApi.manual({ email: manualEmail.trim(), eventId }, token);
      toast.success(`✓ Checked in: ${(result as unknown as { attendee: { name: string } }).attendee.name}`);
      setManualEmail("");
      refreshStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setIsManual(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/dashboard">
          <ArrowLeft className="mr-1.5 size-4" /> Back to Dashboard
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Check-In</h1>
        {stats && <p className="text-sm text-muted-foreground">{stats.event.title}</p>}
      </div>

      {/* Stats bar */}
      {isLoadingStats ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-4"><CardTitle className="text-xs text-muted-foreground">Registered</CardTitle></CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold">{stats.registered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-4"><CardTitle className="text-xs text-muted-foreground">Checked In</CardTitle></CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-4"><CardTitle className="text-xs text-muted-foreground">Check-In Rate</CardTitle></CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-2xl font-bold">{stats.checkInRate}%</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Check-in methods */}
      <Tabs defaultValue="qr">
        <TabsList className="w-full">
          <TabsTrigger value="qr" className="flex-1">
            <QrCode className="mr-2 size-4" /> QR Code
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">
            <Search className="mr-2 size-4" /> Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scan QR Code</CardTitle>
              <p className="text-sm text-muted-foreground">
                Scan the attendee's QR code using a barcode scanner, or paste the ticket ID below.
                Connect a USB scanner and it will auto-submit on scan.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQRScan} className="flex gap-2">
                <Input
                  ref={qrRef}
                  placeholder="Scan QR or paste ticket ID..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  autoFocus
                  className="font-mono text-sm"
                />
                <Button type="submit" disabled={isScanning || !qrInput.trim()}>
                  {isScanning ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manual Check-In</CardTitle>
              <p className="text-sm text-muted-foreground">Search by attendee email address</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualCheckIn} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="attendee@example.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                />
                <Button type="submit" disabled={isManual || !manualEmail.trim()}>
                  {isManual ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent check-ins */}
      {stats && stats.recent.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="size-4" /> Recent Check-Ins
          </h2>
          <div className="space-y-1 text-sm">
            {stats.recent.map((ci) => (
              <div key={ci.id} className="flex items-center justify-between py-2">
                <span className="font-medium">{ci.ticket.user.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{ci.ticket.user.email}</span>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(ci.checkedInAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
