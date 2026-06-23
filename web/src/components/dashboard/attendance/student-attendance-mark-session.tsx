"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Monitor,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useGeolocation } from "@/hooks/use-geolocation";
import { usePageLoading } from "@/hooks/use-page-loading";
import { formatDistance, getDistanceMeters } from "@/lib/attendance-geolocation";
import { cn } from "@/lib/utils";
import {
  addLiveAttendanceMark,
  buildDemoSessions,
  formatSessionTimeRange,
  getLiveMarkForSession,
  getSessionWindowState,
  hasMarkedSession,
  resolveAttendanceStatus,
  useLiveAttendanceMarks,
} from "./attendance-live-store";
import { AttendancePanel, AttendanceStatusBadge, attendanceHref } from "./attendance-ui";
import { attendanceMarkHref } from "./student-attendance-data";
import { StudentAttendanceListSkeleton } from "./student-attendance-skeleton";

type HybridChannel = "physical" | "virtual";

type MarkSessionProps = {
  sessionId: string;
};

export function StudentAttendanceMarkSession({ sessionId }: MarkSessionProps) {
  const isLoading = usePageLoading();
  const now = useCurrentTime();
  const liveMarks = useLiveAttendanceMarks();
  const { state: geoState, requestLocation, reset: resetGeo } = useGeolocation();

  const [hybridChannel, setHybridChannel] = useState<HybridChannel>("physical");
  const [virtualCode, setVirtualCode] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const session = useMemo(() => {
    const sessions = buildDemoSessions(now);
    return sessions.find((item) => item.id === sessionId);
  }, [sessionId, now.toDateString()]);

  const marked = hasMarkedSession(sessionId);
  const liveMark = getLiveMarkForSession(sessionId);
  const windowState = session ? getSessionWindowState(session, now, marked) : "ended";

  const effectiveMode =
    session?.mode === "hybrid" ? hybridChannel : session?.mode ?? "physical";

  const campusTarget =
    session?.latitude != null && session?.longitude != null
      ? { latitude: session.latitude, longitude: session.longitude }
      : null;

  const distanceMeters =
    geoState.status === "ready" && campusTarget
      ? getDistanceMeters(geoState.position, campusTarget)
      : null;

  const geofenceRadius = session?.geofenceRadiusMeters ?? 200;
  const withinGeofence =
    distanceMeters != null ? distanceMeters <= geofenceRadius : false;

  async function submitMark(payload: {
    method: string;
    latitude?: number;
    longitude?: number;
    virtualCode?: string;
    joinedViaLink?: boolean;
  }) {
    if (!session) return;

    setSubmitState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          method: payload.method,
          latitude: payload.latitude,
          longitude: payload.longitude,
          virtualCode: payload.virtualCode,
          joinedViaLink: payload.joinedViaLink,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        const errMsg =
          (json as { message?: string; error?: string }).message ??
          (json as { message?: string; error?: string }).error ??
          "Unable to mark attendance.";
        throw new Error(errMsg);
      }

      const data = json.data as {
        status: "present" | "late";
        method: string;
        distanceMeters?: number;
      };

      addLiveAttendanceMark({
        session,
        status: data.status,
        method: data.method as Parameters<typeof addLiveAttendanceMark>[0]["method"],
        markedAt: now,
        latitude: payload.latitude,
        longitude: payload.longitude,
        distanceMeters: data.distanceMeters,
      });

      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to mark attendance.");
    }
  }

  function handlePhysicalMark() {
    if (!session || geoState.status !== "ready" || !campusTarget) return;

    void submitMark({
      method: session.mode === "hybrid" ? "hybrid-geolocation" : "physical-geolocation",
      latitude: geoState.position.latitude,
      longitude: geoState.position.longitude,
    });
  }

  function handleVirtualCodeMark() {
    if (!session) return;

    void submitMark({
      method: session.mode === "hybrid" ? "hybrid-virtual" : "virtual-code",
      virtualCode: virtualCode.trim(),
    });
  }

  function handleVirtualLinkMark() {
    if (!session?.meetingUrl) return;

    window.open(session.meetingUrl, "_blank", "noopener,noreferrer");

    void submitMark({
      method: "virtual-link",
      joinedViaLink: true,
      virtualCode: session.virtualCode,
    });
  }

  if (isLoading) {
    return <StudentAttendanceListSkeleton />;
  }

  if (!session) {
    return (
      <AttendancePanel className="text-center">
        <h2 className="text-lg font-bold">Session not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This class session is not scheduled for today.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href={attendanceMarkHref()}>Back to today&apos;s classes</Link>
        </Button>
      </AttendancePanel>
    );
  }

  if (windowState === "marked" && liveMark) {
    return (
      <div className="space-y-5">
        <Link
          href={attendanceMarkHref()}
          className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to today&apos;s classes
        </Link>

        <AttendancePanel className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green" />
          <h2 className="mt-4 text-xl font-bold">Attendance marked</h2>
          <p className="mt-2 text-sm text-muted-foreground">{session.className}</p>
          <div className="mt-4 flex justify-center">
            <AttendanceStatusBadge status={liveMark.status} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Checked in at{" "}
            {liveMark.markedAt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={attendanceHref("history")}>View history</Link>
            </Button>
            <Button asChild className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90">
              <Link href={attendanceMarkHref()}>Other classes</Link>
            </Button>
          </div>
        </AttendancePanel>
      </div>
    );
  }

  if (windowState === "upcoming" || windowState === "ended") {
    return (
      <div className="space-y-5">
        <Link
          href={attendanceMarkHref()}
          className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to today&apos;s classes
        </Link>

        <AttendancePanel>
          <h2 className="text-lg font-bold">{session.className}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{formatSessionTimeRange(session)}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            {windowState === "upcoming"
              ? "Check-in opens when the class starts."
              : "The check-in window for this class has closed."}
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link href={attendanceMarkHref()}>Back to today&apos;s classes</Link>
          </Button>
        </AttendancePanel>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={attendanceMarkHref()}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to today&apos;s classes
      </Link>

      <AttendancePanel className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Mark attendance
          </p>
          <h2 className="mt-1 text-xl font-bold">{session.className}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.teacher} · {formatSessionTimeRange(session)}
          </p>
        </div>

        {session.mode === "hybrid" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setHybridChannel("physical");
                resetGeo();
                setErrorMessage(null);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                hybridChannel === "physical"
                  ? "bg-brand-blue text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <MapPin className="h-4 w-4" />
              On campus
            </button>
            <button
              type="button"
              onClick={() => {
                setHybridChannel("virtual");
                resetGeo();
                setErrorMessage(null);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                hybridChannel === "virtual"
                  ? "bg-brand-purple text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Monitor className="h-4 w-4" />
              Online
            </button>
          </div>
        ) : null}

        {effectiveMode === "physical" ? (
          <PhysicalMarkPanel
            geoState={geoState}
            distanceMeters={distanceMeters}
            geofenceRadius={geofenceRadius}
            withinGeofence={withinGeofence}
            room={session.room}
            building={session.building}
            onRequestLocation={requestLocation}
            onMark={handlePhysicalMark}
            isSubmitting={submitState === "loading"}
          />
        ) : (
          <VirtualMarkPanel
            virtualCode={virtualCode}
            onVirtualCodeChange={setVirtualCode}
            meetingUrl={session.meetingUrl}
            onMarkWithCode={handleVirtualCodeMark}
            onMarkWithLink={handleVirtualLinkMark}
            isSubmitting={submitState === "loading"}
          />
        )}

        {errorMessage ? (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p>
        ) : null}

        {submitState === "success" ? (
          <p className="rounded-2xl bg-green/10 px-4 py-3 text-sm text-green">
            Attendance recorded as {resolveAttendanceStatus(session, now)}.
          </p>
        ) : null}
      </AttendancePanel>
    </div>
  );
}

function PhysicalMarkPanel({
  geoState,
  distanceMeters,
  geofenceRadius,
  withinGeofence,
  room,
  building,
  onRequestLocation,
  onMark,
  isSubmitting,
}: {
  geoState: ReturnType<typeof useGeolocation>["state"];
  distanceMeters: number | null;
  geofenceRadius: number;
  withinGeofence: boolean;
  room?: string;
  building?: string;
  onRequestLocation: () => void;
  onMark: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl bg-muted/35 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/15 text-brand-blue">
          <Navigation className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Campus check-in</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your location to verify you are within {geofenceRadius} m of{" "}
            {building ? `${building} · ${room}` : "the classroom"}.
          </p>
        </div>
      </div>

      {geoState.status === "idle" ? (
        <Button
          type="button"
          onClick={onRequestLocation}
          className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Use my location
        </Button>
      ) : null}

      {geoState.status === "loading" ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reading your location…
        </div>
      ) : null}

      {geoState.status === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{geoState.message}</p>
          <Button type="button" variant="outline" onClick={onRequestLocation} className="rounded-full">
            Try again
          </Button>
        </div>
      ) : null}

      {geoState.status === "ready" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Your distance</p>
              <p className="mt-1 text-sm font-semibold">
                {distanceMeters != null ? formatDistance(distanceMeters) : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">GPS accuracy</p>
              <p className="mt-1 text-sm font-semibold">±{Math.round(geoState.accuracy)} m</p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
              withinGeofence ? "bg-green/10 text-green" : "bg-destructive/10 text-destructive",
            )}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {withinGeofence
              ? "You are inside the classroom geofence."
              : `Move closer — you must be within ${geofenceRadius} m to mark attendance.`}
          </div>

          <Button
            type="button"
            disabled={!withinGeofence || isSubmitting}
            onClick={onMark}
            className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marking…
              </>
            ) : (
              "Mark present on campus"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function VirtualMarkPanel({
  virtualCode,
  onVirtualCodeChange,
  meetingUrl,
  onMarkWithCode,
  onMarkWithLink,
  isSubmitting,
}: {
  virtualCode: string;
  onVirtualCodeChange: (value: string) => void;
  meetingUrl?: string;
  onMarkWithCode: () => void;
  onMarkWithLink: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl bg-muted/35 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
          <Monitor className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Virtual check-in</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the class code from your teacher or join the live session link.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="virtual-code" className="text-xs font-medium text-muted-foreground">
          Class code
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="virtual-code"
            value={virtualCode}
            onChange={(event) => onVirtualCodeChange(event.target.value)}
            placeholder="e.g. CS2026"
            className="min-w-0 flex-1 rounded-full"
            autoComplete="off"
          />
          <Button
            type="button"
            disabled={!virtualCode.trim() || isSubmitting}
            onClick={onMarkWithCode}
            className="shrink-0 rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify code"
            )}
          </Button>
        </div>
      </div>

      {meetingUrl ? (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Or join the live class</p>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onMarkWithLink}
            className="mt-2 w-full shrink-0 rounded-full px-4 sm:w-auto"
          >
            Join meeting & mark attendance
          </Button>
        </div>
      ) : null}
    </div>
  );
}
