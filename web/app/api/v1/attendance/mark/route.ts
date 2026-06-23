import { NextRequest, NextResponse } from "next/server";
import { getDistanceMeters, isWithinGeofence } from "@/lib/attendance-geolocation";
import { buildDateTime, startOfDay } from "@/lib/schedule-time";
import { createApiError, createApiResponse } from "@/shared";

type AttendanceSession = {
  id: string;
  mode: "physical" | "virtual" | "hybrid";
  startsAt: Date;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  virtualCode?: string;
};

const DEMO_CAMPUS = { latitude: 40.758, longitude: -73.9855 };

function buildSessions(referenceDate = new Date()): AttendanceSession[] {
  const today = startOfDay(referenceDate);

  return [
    {
      id: "sess-english",
      mode: "physical",
      startsAt: buildDateTime(today, 8, 0),
      latitude: DEMO_CAMPUS.latitude,
      longitude: DEMO_CAMPUS.longitude,
      geofenceRadiusMeters: 200,
    },
    {
      id: "sess-cs",
      mode: "virtual",
      startsAt: buildDateTime(today, 10, 0),
      virtualCode: "CS2026",
    },
    {
      id: "sess-business",
      mode: "hybrid",
      startsAt: buildDateTime(today, 13, 0),
      latitude: DEMO_CAMPUS.latitude + 0.0008,
      longitude: DEMO_CAMPUS.longitude + 0.0005,
      geofenceRadiusMeters: 200,
      virtualCode: "BUS330",
    },
    {
      id: "sess-design",
      mode: "virtual",
      startsAt: buildDateTime(today, 15, 0),
      virtualCode: "DS118",
    },
  ];
}

function resolveStatus(session: AttendanceSession, now: Date) {
  const lateAfterMs = 15 * 60 * 1000;
  return now.getTime() > session.startsAt.getTime() + lateAfterMs ? "late" : "present";
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    sessionId,
    method,
    latitude,
    longitude,
    virtualCode,
    joinedViaLink,
  } = body as {
    sessionId?: string;
    method?: string;
    latitude?: number;
    longitude?: number;
    virtualCode?: string;
    joinedViaLink?: boolean;
  };

  if (!sessionId || !method) {
    return NextResponse.json(
      createApiError("validation_error", "sessionId and method are required"),
      { status: 400 },
    );
  }

  const session = buildSessions().find((item) => item.id === sessionId);
  if (!session) {
    return NextResponse.json(createApiError("not_found", "Session not found"), { status: 404 });
  }

  const now = new Date();

  if (method === "physical-geolocation" || method === "hybrid-geolocation") {
    if (latitude == null || longitude == null) {
      return NextResponse.json(
        createApiError("validation_error", "Location is required for physical attendance"),
        { status: 400 },
      );
    }

    if (session.latitude == null || session.longitude == null) {
      return NextResponse.json(
        createApiError("validation_error", "This session does not support campus check-in"),
        { status: 400 },
      );
    }

    const target = { latitude: session.latitude, longitude: session.longitude };
    const user = { latitude, longitude };
    const radius = session.geofenceRadiusMeters ?? 200;
    const distanceMeters = getDistanceMeters(user, target);

    if (!isWithinGeofence(user, target, radius)) {
      return NextResponse.json(
        createApiError(
          "geofence_error",
          `You are ${Math.round(distanceMeters)} m away. Move within ${radius} m of the classroom.`,
        ),
        { status: 403 },
      );
    }

    return NextResponse.json(
      createApiResponse(
        {
          sessionId,
          status: resolveStatus(session, now),
          method,
          distanceMeters,
        },
        "Attendance marked on campus",
      ),
      { status: 201 },
    );
  }

  if (method === "virtual-code" || method === "hybrid-virtual") {
    const expected = session.virtualCode?.toUpperCase();
    const provided = virtualCode?.trim().toUpperCase();

    if (!expected || !provided || provided !== expected) {
      return NextResponse.json(
        createApiError("invalid_code", "Invalid class code. Check the code from your teacher."),
        { status: 403 },
      );
    }

    return NextResponse.json(
      createApiResponse(
        {
          sessionId,
          status: resolveStatus(session, now),
          method,
        },
        "Attendance marked via virtual code",
      ),
      { status: 201 },
    );
  }

  if (method === "virtual-link") {
    if (!joinedViaLink) {
      return NextResponse.json(
        createApiError("validation_error", "Join the meeting link before marking attendance"),
        { status: 400 },
      );
    }

    return NextResponse.json(
      createApiResponse(
        {
          sessionId,
          status: resolveStatus(session, now),
          method,
        },
        "Attendance marked after joining session",
      ),
      { status: 201 },
    );
  }

  return NextResponse.json(createApiError("validation_error", "Unsupported attendance method"), { status: 400 });
}
